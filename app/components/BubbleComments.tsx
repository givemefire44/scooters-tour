import React from "react";

// Puedes cambiar estos links por tus propios avatares cuando quieras
const avatars = [
  "/images/rider-4.jpg",
  "/images/rider-2.jpg",
  "/images/rider-3.jpg",
  "/images/rider-1.jpg",
];
export default function BubbleComments({ comments }: { comments: any[] }) {
  return (
    <div className="bubble-comments">
      {comments.map((comment: any, idx: number) => (
        <div
          key={idx}
          className="bubble-comment"
        >
          <img
            src={avatars[idx % avatars.length]}
            alt="avatar"
            className="bubble-avatar"
          />
          <div className="bubble-text">
            {comment.text}
          </div>
        </div>
      ))}
    </div>
  );
}
