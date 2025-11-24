"use client";
import React, { useState } from "react";

const testimonials = [
  {
    quote: "Amazing experience! Riding through the city was thrilling. Our guide knew all the best spots, shared great stories and made it fun",
    author: "Mary, London",
  },
  {
    quote: "Best tour ever! The scooter gave us freedom to explore places buses can't reach. Our guide was knowledgeable and fun!",
    author: "Jake, New York",
  },
  {
    quote: "Absolutely loved it! Felt the wind, saw hidden gems, and made incredible memories. Highly recommend this adventure!",
    author: "Sophie, Paris",
  },
  {
    quote: "The highlight of our trip! Riding through the streets on a Vespa was magical. Our guide made us feel like locals",
    author: "Marco, Milan",
  },
  {
    quote: "So much fun! We covered more ground than walking tours and it was way more exciting. Perfect for couples!",
    author: "Emma, Sydney",
  },
  {
    quote: "Our guide was fantastic - great routes, interesting history, and plenty of photo stops. The scooter made it unforgettable!",
    author: "Carlos, Buenos Aires",
  },
  {
    quote: "I was nervous at first, but the guide made me feel confident. Now I can't imagine touring any other way!",
    author: "Lisa, Toronto",
  },
  {
    quote: "The freedom of riding combined with expert local knowledge = perfect tour. We discovered places we'd never find alone",
    author: "Tom, Dublin",
  },
  {
    quote: "Incredible way to see the city! Wind in your hair, sun on your face, and a knowledgeable guide leading the way. Pure joy!",
    author: "Ana, Madrid",
  },
  {
    quote: "This wasn't just a tour, it was an adventure! The scooter ride through the streets was exhilarating. 10/10 would do again",
    author: "David, Berlin",
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
