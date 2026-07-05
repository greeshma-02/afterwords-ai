import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from "react-router-dom";
import BookDetail from "./BookDetail";
import WriteReflection from "./WriteReflection";
import ReflectionDetail from "./ReflectionDetail";
import ReflectionsPage from "./ReflectionsPage";
import SignInPage from "./SignInPage";
import SignUpPage from "./SignUpPage";
import AppHeader from "./AppHeader";
import { fetchReflection } from "./reflectionApi";
import type { ApiReflection } from "./reflectionApi";
import { ROUTES } from "./routes";

interface Book {
  id: number;
  title: string;
  author: string;
  imageUrl?: string;
  description?: string;
  sadness?: number;
  comfort?: number;
  hope?: number;
  joy?: number;
  humor?: number;
  connection?: number;
  intensity?: number;
}

type MoodKey =
  | "Melancholy"
  | "Healing"
  | "Joy"
  | "Loneliness"
  | "Hope"
  | "Comfort"
  | "Sadness"
  | "Friendship";

const MOOD_TO_EMOTION: Record<MoodKey, string> = {
  Melancholy: "sadness",
  Healing: "comfort",
  Joy: "joy",
  Loneliness: "friendship",
  Hope: "hope",
  Comfort: "comfort",
  Sadness: "sadness",
  Friendship: "friendship",
};

const FALLBACK_COVER_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBH7CXaV-pWWPXQLlVSj2pfk8s52zmA_VH9uWJajzB-a_3QfQNmiiWqZriD9vy7s2pT5SZ-3yzMcMqCgXFGd8TS35m34mBrjstQ3ZoheAIxs0s0U17QwpZUtlix0SVBUUV_oqMdDxrSs8m0NAbskPkktLKt7dgkiXpWT5b0tBpMEnSr3vJ_MLEdOJo_2yAInH8v0tLFj4psaZo0VB24r_X53daTqn2WtcqR_KYax8UeRHzhfWDMWZNAV7-SYzkDH9GnkRN5G73T01UI";

function moodTags(book: Book): string[] {
  const tags: string[] = [];
  if (book.comfort && book.comfort >= 4) tags.push("Comforting");
  if (book.sadness && book.sadness >= 4) tags.push("Melancholic");
  if (book.hope && book.hope >= 4) tags.push("Hopeful");
  if (book.joy && book.joy >= 4) tags.push("Joyful");
  if (book.humor && book.humor >= 4) tags.push("Humorous");
  if (book.connection && book.connection >= 4) tags.push("Connected");
  if (book.intensity !== undefined && book.intensity <= 2) tags.push("Gentle");
  return tags.slice(0, 3);
}

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5259/api/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setBook(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  if (loading) {
    return (
      <p className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-slate-400">
        Loading…
      </p>
    );
  }
  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-slate-400 mb-4">Book not found.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          className="text-primary hover:underline"
        >
          Back to Shelf
        </button>
      </div>
    );
  }
  return (
    <BookDetail
      book={book}
      tags={moodTags(book)}
      onBack={() => navigate(ROUTES.home)}
      onWriteReflection={() => navigate(ROUTES.writeReflection(book.id))}
    />
  );
};

const WriteReflectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5259/api/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setBook(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  if (loading) {
    return (
      <p className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-slate-400">
        Loading…
      </p>
    );
  }
  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-slate-400 mb-4">Book not found.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          className="text-primary hover:underline"
        >
          Back to Shelf
        </button>
      </div>
    );
  }

  return (
    <WriteReflection
      book={book}
      onBackToShelf={() => navigate(ROUTES.home)}
      onSaved={(reflectionId) => navigate(ROUTES.reflection(reflectionId))}
    />
  );
};

const ReflectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reflection, setReflection] = useState<ApiReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchReflection(id)
      .then((data) => {
        if (!cancelled) setReflection(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;

  if (loading) {
    return (
      <p className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-slate-400">
        Loading…
      </p>
    );
  }

  if (error || !reflection) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-slate-400 mb-4">Reflection not found.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          className="text-primary hover:underline"
        >
          Back to Shelf
        </button>
      </div>
    );
  }

  return (
    <ReflectionDetail
      reflection={reflection}
      onBack={() => navigate(-1)}
    />
  );
};

const App: React.FC = () => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage =
    location.pathname === ROUTES.signIn || location.pathname === ROUTES.signUp;

  const loadAllBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5259/api/books");
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      setAllBooks(safeData);
      setBooks(safeData);
    } catch (e) {
      console.error(e);
      setError("We couldn’t load your shelf. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBooks();
  }, []);

  const performSearch = async (emotion: string) => {
    const trimmed = emotion.trim();
    if (!trimmed) {
      // When cleared, go back to the initial shelf
      await loadAllBooks();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5259/api/books/search?emotion=${encodeURIComponent(
          trimmed,
        )}`,
      );
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];
      setBooks(safeData);
    } catch (e) {
      console.error(e);
      setError("We couldn’t reach the shelves right now.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const onMoodClick = (label: MoodKey) => {
    performSearch(MOOD_TO_EMOTION[label]);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep submit handler for accessibility (Enter key), but logic now lives in onChange
    handleSearchChange(search);
  };

  const handleSearchChange = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setBooks(allBooks);
      return;
    }
    const filtered = allBooks.filter((book) => {
      const title = book.title?.toLowerCase() ?? "";
      const author = book.author?.toLowerCase() ?? "";
      return title.includes(trimmed) || author.includes(trimmed);
    });
    setBooks(filtered);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-cream">
      {!isAuthPage && <div className="paper-grain" />}

      <AppHeader minimal={isAuthPage} />

      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.home} replace />} />
        <Route path={ROUTES.home} element={<>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero & Search */}
        <section className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-slate-100">
            How do you want to feel tonight?
          </h2>
          <p className="italic text-sm tracking-widest mt-2 text-primary/60">
            Take your time.
          </p>

          <form className="mt-10 max-w-2xl mx-auto" onSubmit={onSearchSubmit}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary/50">
                  search
                </span>
              </div>
              <input
                className="w-full bg-primary/5 border border-primary/15 rounded-full py-4 pl-12 pr-4 text-slate-100 focus:ring-1 focus:ring-primary/40 focus:border-primary/40 placeholder:text-primary/40 transition-all outline-none"
                placeholder="Search by feeling or title..."
                type="text"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  handleSearchChange(value);
                }}
              />
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              className="px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium text-xs transition-all"
              onClick={() => onMoodClick("Melancholy")}
            >
              Melancholy
            </button>
            <button
              className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/20 text-primary/70 hover:bg-primary/15 text-xs transition-all"
              onClick={() => onMoodClick("Healing")}
            >
              Healing
            </button>
            <button
              className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/20 text-primary/70 hover:bg-primary/15 text-xs transition-all"
              onClick={() => onMoodClick("Joy")}
            >
              Joy
            </button>
            <button
              className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/20 text-primary/70 hover:bg-primary/15 text-xs transition-all"
              onClick={() => onMoodClick("Loneliness")}
            >
              Loneliness
            </button>
            <button
              className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/20 text-primary/70 hover:bg-primary/15 text-xs transition-all"
              onClick={() => onMoodClick("Hope")}
            >
              Hope
            </button>
            <button
              className="px-5 py-2 rounded-full bg-primary/[0.08] border border-primary/20 text-primary/70 hover:bg-primary/15 text-xs transition-all"
              onClick={() => onMoodClick("Comfort")}
            >
              Comfort
            </button>
          </div>
        </section>

        {/* Tonight's Reading Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-100 italic font-normal">
              Tonight’s Reading
            </h3>
            <a className="text-primary text-sm hover:underline" href="#">
              View all
            </a>
          </div>

          {loading && (
            <p className="text-sm text-slate-400 mb-4">Loading your shelf…</p>
          )}
          {error && <p className="text-sm text-red-300 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => {
              const tags = moodTags(book);

              return (
                <div
                  key={book.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(ROUTES.book(book.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(ROUTES.book(book.id));
                    }
                  }}
                  className="glass-card rounded-2xl p-5 group transition-all hover:bg-primary/[0.05] shadow-xl relative cursor-pointer"
                >
                  <div className="aspect-[2/3] mb-5 overflow-hidden rounded-lg shadow-2xl border border-primary/5">
                    <img
                      className="object-cover size-full opacity-80 group-hover:opacity-100 transition-all duration-700"
                      src={book.imageUrl ?? FALLBACK_COVER_URL}
                      alt={book.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== FALLBACK_COVER_URL) {
                          target.src = FALLBACK_COVER_URL;
                        }
                      }}
                    />
                  </div>
                  <div className="px-1 pb-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h4 className="text-lg font-bold text-slate-100 tracking-tight">
                        {book.title}
                      </h4>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.writeReflection(book.id))}
                          className="flex items-center justify-center size-7 rounded-full border border-primary/20 text-primary/80 hover:text-primary hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors"
                          aria-label="Write a reflection for this book"
                        >
                          <span className="material-symbols-outlined text-sm">
                            ink_pen
                          </span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center size-7 rounded-full border border-primary/20 text-primary/80 hover:text-primary hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors"
                          aria-label="Save to Afterwords"
                        >
                          <span className="material-symbols-outlined text-sm">
                            bookmark_add
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="text-primary/80 text-xs mb-4 italic">
                      {book.author}
                    </p>
                    <div className="flex gap-2">
                      {tags.length > 0 ? (
                        <>
                          <span className="text-[9px] uppercase tracking-wider font-bold border border-primary/20 px-2 py-0.5 rounded text-primary">
                            {tags[0]}
                          </span>
                          {tags.slice(1).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] uppercase tracking-wider font-bold border border-primary/20 px-2 py-0.5 rounded text-primary/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider font-bold border border-primary/20 px-2 py-0.5 rounded text-primary/70">
                          From your Afterwords shelf
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reflection Prompt Card */}
        <section className="mb-14">
          <div className="bg-primary/[0.03] border-t border-b border-primary/10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-10 text-center">
            <span className="material-symbols-outlined text-primary/60 text-3xl mb-4">
              ink_pen
            </span>
            <p className="text-xl font-medium text-slate-200 mb-6 italic max-w-lg mx-auto">
              What did you finish recently? Write a reflection.
            </p>
            <button className="text-xs font-bold text-primary border-b border-primary/30 pb-1 uppercase tracking-widest hover:text-primary/80 transition-colors">
              Start a new entry
            </button>
          </div>
        </section>
      </main>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
        <blockquote className="text-2xl md:text-3xl font-display italic text-primary/80 leading-relaxed">
          &ldquo;I have always imagined that Paradise will be a kind of library.&rdquo;
        </blockquote>
        <cite className="block mt-6 text-sm uppercase tracking-widest text-primary/40 font-sans">
          — Jorge Luis Borges
        </cite>
      </section>

      <footer className="border-t border-primary/5 py-10 text-center text-slate-500">
        <div className="flex justify-center gap-8 mb-6">
          <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors text-primary/60">
            book_2
          </span>
          <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors text-primary/60">
            edit_note
          </span>
          <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors text-primary/60">
            person_2
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/50">
          © 2026 Afterwords. Breathe deeply.
        </p>
      </footer>
      </>} />
        <Route path={ROUTES.reflections} element={<ReflectionsPage />} />
        <Route path={ROUTES.signIn} element={<SignInPage />} />
        <Route path={ROUTES.signUp} element={<SignUpPage />} />
        <Route path="/afterwords/book/:id" element={<BookDetailPage />} />
        <Route path="/afterwords/book/:id/write-reflection" element={<WriteReflectionPage />} />
        <Route path="/afterwords/reflection/:id" element={<ReflectionDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;

