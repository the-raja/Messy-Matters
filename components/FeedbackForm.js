import React, { useState } from "react";

const EMOJIS = ["😡", "😐", "🙂", "😄", "🤩"];

export default function FeedbackForm({
  day = "monday",
  meal = "lunch",
  onSubmitted,
}) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          meal,
          rating,
          comment,
          name,
          anonymous,
        }),
      });

      if (res.ok) {
        setComment("");
        setName("");
        setRating(4);
        onSubmitted?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="feedback-card">
      {/* Rating */}
      <div className="feedback-row">
        <span className="feedback-label">How was the {meal}?</span>

        <div className="emoji-rating">
          {EMOJIS.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className={`emoji-btn ${rating === i + 1 ? "active" : ""}`}
              onClick={() => setRating(i + 1)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <textarea
        className="glass-textarea"
        placeholder={
          rating <= 2
            ? "What went wrong?"
            : rating === 3
            ? "What can we improve?"
            : "What did you like?"
        }
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Name + Anonymous */}
      <div className="feedback-footer">
        {!anonymous && (
          <input
            className="glass-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <label className="anon-toggle">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Submit anonymously
        </label>
      </div>

      {/* Submit */}
      <button className="submit-btn" type="submit" disabled={loading}>
        {loading ? "Sending…" : "Submit Feedback 🚀"}
      </button>
    </form>
  );
}
