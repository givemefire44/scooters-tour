"use client";
import React, { useState } from "react";

const testimonials = [
  {
    quote: "Amazing experience! The guide was just simply very good. A mix of good information, little stories and light humour.",
    author: "Mary, London",
  },
  {
    quote: "El hostel organizó actividades todos los días. ¡Nunca estuve solo!",
    author: "John, UK",
  },
  {
    quote: "Me sentí seguro y bienvenido desde el primer día.",
    author: "Lucas, Brasil",
  },
];

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  return (
    <div className="testimonial-carousel">
      <blockquote>
        “{testimonials[active].quote}”
      </blockquote>
      <div className="testimonial-carousel-author">
        — {testimonials[active].author}
      </div>
      <div className="testimonial-carousel-dots">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={
              "testimonial-carousel-dot" + (i === active ? " active" : "")
            }
            onClick={() => setActive(i)}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
