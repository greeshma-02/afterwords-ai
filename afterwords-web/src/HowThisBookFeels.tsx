import React from "react";

const FEELINGS: { key: "comfort" | "sadness" | "hope" | "humor"; label: string }[] = [
  { key: "comfort", label: "Comfort" },
  { key: "sadness", label: "Melancholy" },
  { key: "hope", label: "Hope" },
  { key: "humor", label: "Humor" },
];

const MAX_DOTS = 5;

interface HowThisBookFeelsProps {
  book: {
    comfort?: number;
    sadness?: number;
    hope?: number;
    humor?: number;
  };
}

const DotRating: React.FC<{ value: number }> = ({ value }) => {
  const filled = Math.min(MAX_DOTS, Math.max(0, Math.round(value ?? 0)));
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${filled} out of ${MAX_DOTS}`}>
      {Array.from({ length: MAX_DOTS }, (_, i) => (
        <span
          key={i}
          className={`size-2 rounded-full shrink-0 ${
            i < filled ? "bg-primary" : "bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
};

const HowThisBookFeels: React.FC<HowThisBookFeelsProps> = ({ book }) => {
  const getValue = (key: "comfort" | "sadness" | "hope" | "humor"): number => {
    const v = book[key];
    return typeof v === "number" ? v : 0;
  };

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-200 mb-1">
        How this book feels
      </h2>
      <p className="text-xs text-slate-500 italic mb-5">Based on reader reflections</p>
      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        {FEELINGS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="text-slate-300 text-sm">{label}</span>
            <DotRating value={getValue(key)} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowThisBookFeels;
