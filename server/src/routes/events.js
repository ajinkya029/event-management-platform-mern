import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import auth from '../middleware/auth.js';

const router = Router();
const fields = ['title', 'description', 'category', 'location', 'startsAt', 'endsAt', 'capacity', 'imageUrl'];
const clean = body => Object.fromEntries(fields.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
const validDates = data => data.startsAt && data.endsAt && new Date(data.startsAt) < new Date(data.endsAt);

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.q) filter.$or = [
      { title: { $regex: req.query.q, $options: 'i' } },
      { description: { $regex: req.query.q, $options: 'i' } },
      { location: { $regex: req.query.q, $options: 'i' } }
    ];
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    filter.startsAt = { $gte: new Date() };
    const events = await Event.find(filter).populate('organizer', 'name').sort({ startsAt: 1 });
    res.json({ events });
  } catch (e) { next(e); }
});

router.get('/mine/organized', auth, async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).populate('organizer', 'name').sort({ startsAt: 1 });
    res.json({ events });
  } catch (e) { next(e); }
});

router.get('/mine/registered', auth, async (req, res, next) => {
  try {
    const events = await Event.find({ attendees: req.user._id }).populate('organizer', 'name').sort({ startsAt: 1 });
    res.json({ events });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID' });
    const event = await Event.findById(req.params.id).populate('organizer', 'name').populate('attendees', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (e) { next(e); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.title || !data.description || !data.location || !validDates(data) || Number(data.capacity) < 1)
      return res.status(400).json({ message: 'Complete all required fields and provide a valid date range and capacity' });
    const event = await Event.create({ ...data, organizer: req.user._id });
    res.status(201).json({ event });
  } catch (e) { next(e); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.organizer.equals(req.user._id)) return res.status(403).json({ message: 'Only the organizer can edit this event' });
    const data = clean(req.body);
    if (data.startsAt && data.endsAt && !validDates(data)) return res.status(400).json({ message: 'End date must be after start date' });
    Object.assign(event, data);
    await event.save();
    res.json({ event });
  } catch (e) { next(e); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.organizer.equals(req.user._id)) return res.status(403).json({ message: 'Only the organizer can delete this event' });
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/register', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.equals(req.user._id)) return res.status(400).json({ message: 'Organizers cannot register for their own event' });
    if (event.attendees.some(id => id.equals(req.user._id))) return res.status(409).json({ message: 'You are already registered' });
    if (event.attendees.length >= event.capacity) return res.status(409).json({ message: 'This event is full' });
    event.attendees.push(req.user._id);
    await event.save();
    res.json({ message: 'Registration successful' });
  } catch (e) { next(e); }
});

router.delete('/:id/register', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.attendees = event.attendees.filter(id => !id.equals(req.user._id));
    await event.save();
    res.json({ message: 'Registration cancelled' });
  } catch (e) { next(e); }
});

export default router;
