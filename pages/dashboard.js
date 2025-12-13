import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import "chart.js/auto";
import useSWR from "swr";
import dynamic from "next/dynamic";

const Bar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data, mutate } = useSWR("/api/stats", fetcher);
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [day, setDay] = useState("monday");
  const [meal, setMeal] = useState("lunch");
  const [items, setItems] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((json) => {
        if (json.authed) setAuthed(true);
        else router.push("/warden/login");
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/warden/login");
  }

  async function saveMenu(e) {
    e.preventDefault();
    const list = items
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, meal, items: list }),
    });

    setItems("");
    mutate();
    await fetch("/api/menu");
  }

 const rawLabels = data ? Object.keys(data.byMeal) : [];
  const labels = rawLabels.map((k) => k.replace("|", "-"));
  const avgs = rawLabels.map((k) => Number(data.byMeal[k].avg.toFixed(2))); 

  const chartRef = useRef(null);
 const chartKey = labels.join(",") + "::" + avgs.join("-");

  useEffect(() => {
    return () => {
      try {
        chartRef.current?.destroy?.();
      } catch {}
    };
  }, [chartKey]);

  if (!authed)
    return (
      <div className="container">
        <div className="card themed-card">
          <h2>Access Denied</h2>
          <p className="muted">You must be a warden to view this page.</p>
          <a className="btn themed-btn" href="/warden/login">
            Go to Login
          </a>
        </div>
      </div>
    );

  return (
    <div className="container themed">
      {/* HEADER */}
      <header className="header themed-header">
        <div className="title-block">
          <h1>
            Warden <span>Dashboard</span>
          </h1>
          <p className="header-sub">Mess Control & Analytics</p>
        </div>

        <div className="controls">
          <a className="btn alt" href="/menu">
            Public View
          </a>
          <button className="btn themed-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* CHART */}
      <section className="card themed-card">
        <div className="card-head">
          <h3>Average Ratings</h3>
        </div>

        {data ? (
          <div className="chart-wrap">
            <Bar
              key={chartKey}
              ref={chartRef}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 5 } },
              }}
              data={{
                labels,
                datasets: [
                  {
                    label: "Avg Rating",
                    data: avgs,
                    backgroundColor: "#38bdf8",
                    borderRadius: 8,
                  },
                ],
              }}
            />
          </div>
        ) : (
          "Loading…"
        )}
      </section>

      {/* FEEDBACK */}
      <section className="card themed-card">
        <div className="card-head">
          <h3>Recent Feedback</h3>
        </div>

        <div className="feedback-list">
          {data?.feedback
            ?.slice()
            .reverse()
            .map((f) => (
              <div key={f.id} className="feedback-card-admin">
                <div className="feedback-meta">
                  {f.day} • {f.meal} • ⭐ {f.rating} • {f.name || "Anonymous"}
                </div>
                <div className="feedback-text">
                  {f.comment || (
                    <span className="muted">(no comment)</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* UPDATE MENU */}
      <section className="card themed-card">
        <div className="card-head">
          <h3>Update Menu</h3>
        </div>

        <form className="menu-form" onSubmit={saveMenu}>
          <div className="menu-row">
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {["Breakfast", "Lunch", "Snacks", "Dinner"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <input
            className="glass-input"
            placeholder="Rice, Dal, Salad"
            value={items}
            onChange={(e) => setItems(e.target.value)}
          />

          <button className="submit-btn" type="submit">
            Save Menu
          </button>
        </form>
      </section>
    </div>
  );
}
