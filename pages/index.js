import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();

  return (
    <div className="cosmic">
      <div className="grid-bg" />
      <div className="glow" />

      <div className="hero">
        <img
          src="/logo.png"
          alt="Messy Matters Logo"
          className="logo"
        />

        <h1 className="title">
          Messy<br />
          <span>Matters</span>
        </h1>

        <p className="subtitle">
          
        </p>

        <div className="glass-card">
          <div className="hostel">
            🍽<strong>Hostel KP-25</strong>
            <span>Smart Mess Interface</span>
          </div>

          <button onClick={() => router.push("/menu")}>
            Enter Mess Menu <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
