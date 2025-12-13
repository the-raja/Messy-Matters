import React from 'react'

export default function RatingStars({ value=0, onChange }){
  return (
    <div className="rating">
      {[1,2,3,4,5].map(i=> (
        <button key={i} className="btn alt" onClick={()=>onChange?.(i)} style={{padding:'6px 8px'}}>
          {i}★
        </button>
      ))}
    </div>
  )
}
