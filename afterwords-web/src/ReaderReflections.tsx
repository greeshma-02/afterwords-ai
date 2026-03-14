import React from "react";

interface Reflection {
  id: string;
  name: string;
  date: string;
  quote: string;
  likes: number;
  comments: number;
  initial: string;
}

const REFLECTIONS: Reflection[] = [
  {
    id: "1",
    name: "Elena Vance",
    date: "Oct 12, 2023",
    quote:
      "This book found me exactly when I needed it. A gentle reminder that every path we didn't take was just another story, not necessarily a better one.",
    likes: 124,
    comments: 18,
    initial: "E",
  },
  {
    id: "2",
    name: "Julian Marsh",
    date: "Sep 28, 2023",
    quote:
      "The concept of the library is stunning. Haig captures the weight of 'what if' with such precision it hurts, then slowly heals.",
    likes: 89,
    comments: 5,
    initial: "J",
  },
  {
    id: "3",
    name: "Clara Solis",
    date: "Sep 15, 2023",
    quote:
      "A philosophical masterpiece masked as a simple novel. I've highlighted half the pages. Truly life-affirming in its melancholy.",
    likes: 210,
    comments: 32,
    initial: "C",
  },
];

const ReaderReflections: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 mb-14">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-100 font-display italic">
          Reader Reflections
        </h3>
        <a
          href="#"
          className="text-primary text-sm hover:underline inline-flex items-center gap-1"
        >
          View All
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REFLECTIONS.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-xl bg-slate-800/60 border border-primary/10 p-6 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {reflection.initial}
              </div>
              <div>
                <p className="font-semibold text-slate-100">{reflection.name}</p>
                <p className="text-xs text-slate-400">{reflection.date}</p>
              </div>
            </div>
            <blockquote className="text-slate-200 italic text-sm leading-relaxed flex-1 mb-5">
              &ldquo;{reflection.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-5 text-slate-400 text-sm">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-base">favorite</span>
                {reflection.likes}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-base">chat_bubble</span>
                {reflection.comments}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReaderReflections;
