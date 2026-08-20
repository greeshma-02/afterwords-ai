import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteReflection,
  fetchMyReflections,
  formatReflectionCardDate,
  reflectionQuote,
  type ApiReflection,
} from "./reflectionApi";
import { ROUTES } from "./routes";

const ReflectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<ApiReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReflections = useCallback(() => {
    setLoading(true);
    setError(null);

    return fetchMyReflections()
      .then((data) => setReflections(data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load reflections.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadReflections().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadReflections]);

  const handleDelete = async (reflection: ApiReflection) => {
    if (
      !window.confirm(
        `Delete your reflection on "${reflection.bookTitle}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(reflection.id);
    try {
      await deleteReflection(reflection.id);
      setReflections((current) => current.filter((item) => item.id !== reflection.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete reflection.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <section className="text-center mb-10">
        <span className="material-symbols-outlined text-primary/60 text-4xl mb-4">
          edit_note
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-slate-100">
          Your Reflections
        </h2>
        <p className="italic text-sm tracking-widest mt-2 text-primary/60">
          Thoughts you&apos;ve saved along the way.
        </p>
      </section>

      {loading && (
        <p className="text-sm text-slate-400 text-center mb-8">Loading reflections…</p>
      )}

      {error && (
        <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-10 text-center mb-8">
          <p className="text-red-300 mb-4">{error}</p>
          {error.includes("sign in") && (
            <Link
              to={ROUTES.signIn}
              className="text-xs font-bold text-primary border-b border-primary/30 pb-1 uppercase tracking-widest hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      )}

      {!loading && !error && reflections.length === 0 && (
        <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-10 text-center">
          <p className="text-slate-300 mb-6 italic">
            Open a book from your shelf and tap the pen to write a reflection.
          </p>
          <Link
            to={ROUTES.home}
            className="text-xs font-bold text-primary border-b border-primary/30 pb-1 uppercase tracking-widest hover:text-primary/80 transition-colors"
          >
            Back to Shelf
          </Link>
        </div>
      )}

      {!loading && !error && reflections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reflections.map((reflection) => (
            <article
              key={reflection.id}
              className="rounded-xl bg-slate-800/60 border border-primary/10 p-6 hover:border-primary/40 hover:bg-slate-800/80 transition-all"
            >
              <button
                type="button"
                onClick={() => navigate(ROUTES.reflection(reflection.id))}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-display text-xl text-slate-100 font-bold mb-1">
                      {reflection.title.trim() || reflection.bookTitle}
                    </h3>
                    <p className="text-sm text-primary/70 italic">
                      {reflection.bookTitle} · {reflection.bookAuthor}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 shrink-0">
                    {reflection.visibility}
                  </span>
                </div>

                <p className="text-slate-300 italic text-sm leading-relaxed mb-4 line-clamp-3">
                  &ldquo;{reflectionQuote(reflection.body)}&rdquo;
                </p>

                <p className="text-xs text-slate-500">
                  {formatReflectionCardDate(reflection.createdAt)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(reflection)}
                disabled={deletingId === reflection.id}
                className="mt-4 text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-200 disabled:opacity-60"
              >
                {deletingId === reflection.id ? "Deleting…" : "Delete"}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default ReflectionsPage;
