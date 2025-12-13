import React from 'react'
import FeedbackForm from './FeedbackForm'

export default function MenuCard({ day='monday', meal='breakfast', items=[] }){
  return (
    <div className="card menu-item">
      <h3 style={{marginTop:0}}>{meal.charAt(0).toUpperCase()+meal.slice(1)} — {day.charAt(0).toUpperCase()+day.slice(1)}</h3>
      <ul>
        {items.map((it,idx)=> <li key={idx}>{it}</li>)}
      </ul>
      <FeedbackForm day={day} meal={meal} onSubmitted={() => { fetch('/api/stats'); fetch('/api/menu'); }} />
    </div>
  )
}
