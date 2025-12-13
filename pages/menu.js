import React, { useState } from "react";
import useSWR from "swr";
import MenuCard from "../components/MenuCard";

const fetcher = (url) => fetch(url).then((r) => r.json());

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function MenuPage() {
  const { data: menu } = useSWR("/api/menu", fetcher);
  const { data: stats } = useSWR("/api/stats", fetcher);

  const today = new Date()
    .toLocaleString("en-us", { weekday: "long" })
    .toLowerCase();

  const [day, setDay] = useState(today);

  if (!menu) return <div className="container">Loading menu…</div>;

  const dayMenu = menu.week?.[day] || {};

  const avgRating = (() => {
    if (!stats?.byMeal) return "No ratings yet";
    const keys = Object.keys(stats.byMeal).filter((k) =>
      k.startsWith(day + "|")
    );
    if (keys.length === 0) return "No ratings yet";
    const avg =
      keys.reduce((sum, k) => sum + Number(stats.byMeal[k].avg || 0), 0) /
      keys.length;
    return avg.toFixed(2) + " ★";
  })();

  return (
    <div className="container themed">
      {/* HEADER */}
      <header className="header themed-header">
        <div className="title-block">
            <div className="title-row">
                <a href="/">
                <img
                  src="/logo.png"
                  alt="Messy Matters Logo"
                  className="title-logo"
                />
               </a>
                <h1>
                Messy <span>Matters</span>
                </h1>
            </div>

            <p className="header-sub">Smart Mess Feedback Dashboard</p>
            </div>

        <div className="controls">
          <select
            className="day-select"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>

          <a className="btn themed-btn" href="/warden/login">
            Warden Login
          </a>
        </div>
      </header>

      {/* MENU */}
      <section className="card themed-card">
        <div className="menu-head">
          <h2>{day.charAt(0).toUpperCase() + day.slice(1)}’s Menu</h2>
          <div className="rating-pill">⭐ {avgRating}</div>
        </div>

        <div className="menu-grid">
          {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
            <MenuCard
              key={meal}
              day={day}
              meal={meal}
              items={dayMenu[meal] || ["No menu set"]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
