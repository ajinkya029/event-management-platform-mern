import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Search,
  Plus,
  LogOut,
  UserRound,
  Ticket,
  Sparkles,
  ArrowRight,
  Clock3,
  Users,
  X,
} from "lucide-react";
import { api, getToken, dateLabel } from "./api";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const categories = [
  "All",
  "Technology",
  "Music",
  "Business",
  "Arts",
  "Food",
  "Sports",
  "Community",
  "Other",
];

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (getToken())
      api("/auth/me")
        .then((d) => setUser(d.user))
        .catch(() => localStorage.removeItem("gather_token"))
        .finally(() => setReady(true));
    else setReady(true);
  }, []);
  const logout = () => {
    localStorage.removeItem("gather_token");
    setUser(null);
  };
  if (!ready) return <div className="loading">Getting things ready…</div>;
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>{" "}
          gather<span className="brand-dot">.</span>
        </Link>
        <nav>
          <Link to="/">Discover</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome">Hi, {user.name.split(" ")[0]}</span>
              <button className="icon-btn" onClick={logout} title="Sign out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Log in
              </Link>
              <Link className="btn btn-small" to="/register">
                Get started <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <div className="footer-brand">
          gather<span className="brand-dot">.</span>
        </div>
        <span>Make plans. Find your people. Create moments.</span>
        <span>© {new Date().getFullYear()} Gather Events</span>
      </footer>
    </AuthContext.Provider>
  );
}

function Home() {
  const [events, setEvents] = useState([]),
    [q, setQ] = useState(""),
    [category, setCategory] = useState("All"),
    [error, setError] = useState("");
  const load = () =>
    api(
      `/events?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`,
    )
      .then((d) => setEvents(d.events))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [category]);
  const submit = (e) => {
    e.preventDefault();
    load();
  };
  return (
    <>
      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content">
          <div className="eyebrow">
            <span /> YOUR CITY, YOUR COMMUNITY
          </div>
          <h1>
            Good things happen
            <br />
            when we <em>gather.</em>
          </h1>
          <p>
            Discover experiences, meet your people, and make memories worth
            sharing.
          </p>
          <form className="searchbar" onSubmit={submit}>
            <Search size={19} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events, places, interests…"
            />
            <button className="btn" type="submit">
              Explore events
            </button>
          </form>
          <div className="hero-note">
            <Users size={15} /> Find your next favorite thing to do
          </div>
        </div>
        <div className="hero-stamp">
          <span>MAKE</span>
          <strong>ROOM</strong>
          <span>FOR FUN ✳</span>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark">CURATED FOR YOU</div>
            <h2>
              Find your next <em>something.</em>
            </h2>
            <p>From big ideas to little moments, there’s a place for you.</p>
          </div>
          <span className="result-count">{events.length} upcoming events</span>
        </div>
        <div className="chips">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip ${category === c ? "active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        {error && <div className="notice error">{error}</div>}
        {events.length ? (
          <div className="event-grid">
            {events.map((event, i) => (
              <EventCard key={event._id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <CalendarDays />
            </div>
            <h3>No events found just yet</h3>
            <p>
              Try another search or category. Your next great plan is out there.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function EventCard({ event, index = 0 }) {
  const palettes = ["peach", "lavender", "mint", "blue"];
  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className={`event-art ${palettes[index % 4]}`}>
        {event.imageUrl && (
          <img
            className="event-cover"
            src={event.imageUrl}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        <span className="event-category">{event.category}</span>
        <span className="art-symbol">✳</span>

        <div className="art-date">
          <strong>{new Date(event.startsAt).getDate()}</strong>
          <span>
            {new Date(event.startsAt).toLocaleString("en", {
              month: "short",
            })}
          </span>
        </div>
      </div>
      <div className="event-info">
        <div className="event-meta">
          <span>
            <MapPin size={13} />
            {event.location}
          </span>
          <span>
            <Users size={13} />
            {event.attendees?.length || 0}/{event.capacity}
          </span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="card-bottom">
          <span>By {event.organizer?.name || "Community host"}</span>
          <span className="card-arrow">
            <ArrowRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function AuthPage({ mode }) {
  const { setUser } = useAuth(),
    nav = useNavigate(),
    [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const register = mode === "register";
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("gather_token", d.token);
      setUser(d.user);
      nav("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="eyebrow dark">WELCOME TO GATHER</div>
        <h1>{register ? "Your people are here." : "Good to see you."}</h1>
        <p>
          {register
            ? "Create an account and start making plans."
            : "Log in to pick up where the good times are."}
        </p>
        <form onSubmit={submit} className="stack-form">
          {register && (
            <label>
              Your name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="8"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <div className="notice error">{error}</div>}
          <button className="btn full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Log in"}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-switch">
          {register ? "Already have an account?" : "New to Gather?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth(),
    nav = useNavigate(),
    [organized, setOrganized] = useState([]),
    [registered, setRegistered] = useState([]),
    [tab, setTab] = useState("organized"),
    [error, setError] = useState("");
  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    Promise.all([api("/events/mine/organized"), api("/events/mine/registered")])
      .then(([a, b]) => {
        setOrganized(a.events);
        setRegistered(b.events);
      })
      .catch((e) => setError(e.message));
  }, [user]);
  const list = tab === "organized" ? organized : registered;
  return (
    <section className="dashboard section">
      <div className="dash-head">
        <div>
          <div className="eyebrow dark">YOUR GATHERING PLACE</div>
          <h1>
            Your dashboard<span className="brand-dot">.</span>
          </h1>
          <p>Hey {user?.name}, here’s what’s happening.</p>
        </div>
        <Link className="btn" to="/events/new">
          <Plus size={17} /> Create event
        </Link>
      </div>
      <div className="stats">
        <div>
          <span>Events hosted</span>
          <strong>{organized.length}</strong>
        </div>
        <div>
          <span>Events joined</span>
          <strong>{registered.length}</strong>
        </div>
        <div>
          <span>Your community</span>
          <strong>
            {organized.reduce((n, e) => n + (e.attendees?.length || 0), 0)}
          </strong>
        </div>
      </div>
      <div className="tabs">
        <button
          className={tab === "organized" ? "selected" : ""}
          onClick={() => setTab("organized")}
        >
          Events you host
        </button>
        <button
          className={tab === "registered" ? "selected" : ""}
          onClick={() => setTab("registered")}
        >
          Events you joined
        </button>
      </div>
      {error && <div className="notice error">{error}</div>}
      {list.length ? (
        <div className="event-grid">
          {list.map((e, i) => (
            <EventCard key={e._id} event={e} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Ticket />
          </div>
          <h3>
            {tab === "organized"
              ? "Your hosting story starts here"
              : "Nothing on your calendar yet"}
          </h3>
          <p>
            {tab === "organized"
              ? "Create an event and bring people together."
              : "Explore events and save a spot at something fun."}
          </p>
          <Link className="btn" to={tab === "organized" ? "/events/new" : "/"}>
            {tab === "organized"
              ? "Create your first event"
              : "Discover events"}
          </Link>
        </div>
      )}
    </section>
  );
}

const blank = {
  title: "",
  description: "",
  category: "Technology",
  location: "",
  startsAt: "",
  endsAt: "",
  capacity: 30,
  imageUrl: "",
};
function EventForm() {
  const { user } = useAuth(),
    nav = useNavigate(),
    { id } = useParams(),
    editing = Boolean(id),
    [form, setForm] = useState(blank),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    if (editing)
      api(`/events/${id}`)
        .then((d) => {
          if (d.event.organizer?._id !== user.id)
            throw new Error("You can only edit events you organize");
          const e = d.event;
          setForm({
            ...e,
            startsAt: new Date(e.startsAt).toISOString().slice(0, 16),
            endsAt: new Date(e.endsAt).toISOString().slice(0, 16),
          });
        })
        .catch((e) => setError(e.message));
  }, [id, user]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api(editing ? `/events/${id}` : "/events", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ ...form, capacity: Number(form.capacity) }),
      });
      nav(`/events/${d.event._id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="form-page">
      <div className="eyebrow dark">
        {editing ? "MAKE IT EVEN BETTER" : "BRING PEOPLE TOGETHER"}
      </div>
      <h1>
        {editing ? "Edit your event" : "Create an event"}
        <span className="brand-dot">.</span>
      </h1>
      <p className="form-intro">
        A few details are all it takes to turn an idea into a plan.
      </p>
      <form className="event-form" onSubmit={submit}>
        <label>
          Event name
          <input
            name="title"
            required
            maxLength="120"
            value={form.title}
            onChange={change}
            placeholder="e.g. Design & Coffee Meetup"
          />
        </label>
        <label>
          About this event
          <textarea
            name="description"
            required
            rows="4"
            value={form.description}
            onChange={change}
            placeholder="What can people look forward to?"
          />
        </label>
        <div className="form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={change}>
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c}>{c}</option>
                ))}
            </select>
          </label>
          <label>
            Location
            <input
              name="location"
              required
              value={form.location}
              onChange={change}
              placeholder="Venue or online"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Starts
            <input
              type="datetime-local"
              required
              name="startsAt"
              value={form.startsAt}
              onChange={change}
            />
          </label>
          <label>
            Ends
            <input
              type="datetime-local"
              required
              name="endsAt"
              value={form.endsAt}
              onChange={change}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Attendee capacity
            <input
              type="number"
              min="1"
              required
              name="capacity"
              value={form.capacity}
              onChange={change}
            />
          </label>
          <label>
            Image URL <span className="optional">(optional)</span>
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={change}
              placeholder="https://…"
            />
          </label>
        </div>
        {error && <div className="notice error">{error}</div>}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>
          <button className="btn" disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Publish event"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}

function EventDetails() {
  const { id } = useParams(),
    { user } = useAuth(),
    nav = useNavigate(),
    [event, setEvent] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api(`/events/${id}`)
      .then((d) => setEvent(d.event))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [id]);
  const mine = event && user && event.organizer?._id === user.id,
    joined =
      event && user && event.attendees?.some((a) => (a._id || a) === user.id);
  const action = async (method) => {
    if (!user) {
      nav("/login");
      return;
    }
    setBusy(true);
    try {
      await api(`/events/${id}/register`, { method });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      nav("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };
  if (!event) return <div className="loading">{error || "Loading event…"}</div>;
  return (
    <section className="detail-page">
      <Link to="/" className="back-link">
        ← Back to discover
      </Link>
      <div
        className={`detail-art ${event.imageUrl ? "has-image" : ""}`}
        style={
          event.imageUrl
            ? {
                backgroundImage: `linear-gradient(90deg,#10182799,#10182722),url(${event.imageUrl})`,
              }
            : {}
        }
      >
        <span className="event-category">{event.category}</span>
        <div>
          <div className="eyebrow">YOU’RE INVITED</div>
          <h1>{event.title}</h1>
        </div>
        <span className="detail-art-shape">✳</span>
      </div>
      <div className="detail-layout">
        <article>
          <div className="detail-facts">
            <span>
              <CalendarDays />
              {dateLabel(event.startsAt)}
            </span>
            <span>
              <MapPin />
              {event.location}
            </span>
            <span>
              <Clock3 />
              Ends {dateLabel(event.endsAt)}
            </span>
            <span>
              <Users />
              {event.attendees?.length || 0} of {event.capacity} spots filled
            </span>
          </div>
          <h2>About this event</h2>
          <p className="detail-description">{event.description}</p>
          <div className="host-box">
            <div className="avatar">
              <UserRound />
            </div>
            <div>
              <small>HOSTED BY</small>
              <strong>{event.organizer?.name || "Community host"}</strong>
            </div>
          </div>
        </article>
        <aside className="join-card">
          <div className="eyebrow dark">SAVE YOUR SPOT</div>
          <h3>Be part of it.</h3>
          <p>
            {Math.max(0, event.capacity - (event.attendees?.length || 0))} spots
            remaining
          </p>
          {mine ? (
            <>
              <Link className="btn full" to={`/events/${id}/edit`}>
                Edit event
              </Link>
              <button className="btn btn-danger full" onClick={remove}>
                Delete event
              </button>
            </>
          ) : joined ? (
            <>
              <div className="notice success">
                You’re on the list. See you there!
              </div>
              <button
                className="btn btn-ghost full"
                disabled={busy}
                onClick={() => action("DELETE")}
              >
                Cancel registration
              </button>
            </>
          ) : (
            <button
              className="btn full"
              disabled={
                busy || (event.attendees?.length || 0) >= event.capacity
              }
              onClick={() => action("POST")}
            >
              {busy
                ? "Please wait…"
                : (event.attendees?.length || 0) >= event.capacity
                  ? "Event is full"
                  : "Register for free"}{" "}
              <ArrowRight size={16} />
            </button>
          )}
          {error && <div className="notice error">{error}</div>}
          <small className="secure-note">
            A little plan can make a big memory.
          </small>
        </aside>
      </div>
    </section>
  );
}

export default App;
