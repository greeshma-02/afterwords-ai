import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "./Button";
import { getStoredAuth } from "./authApi";
import { useAuthPrompt } from "./authPrompt";
import { createReflection } from "./reflectionApi";

const FALLBACK_COVER_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAkQbG_kj3JRUz0VB8m4ZJRq8opz686cDm4QHEhU_ONuq8o4MQlhOEMAUuUI5zysVQjoO1EhkMlIIC6O49zRYWhkCw2Z1MTsPOqa32OVfgazPxmAste-gnO_KIfYRvcP8K3LLCuhhEfN8A3sJqq0lAHtjpamxH94lYvH5ZoWA0P-BrWK63FooZAFXWSAMVNASle7-hQanxJofREn-1GbJ6bmhwFMTK8A_Yb6YiGALdZymfalIlJZJx___WPINiTI_7hUvJSRND92vYf";

const MOODS = ["Comforted", "Hopeful", "Heartbroken", "Reflective", "Inspired"];
const MIN_LINES = 12;
const LINE_HEIGHT_REM = 2.75;

interface WriteReflectionProps {
  book: {
    id: number;
    title: string;
    author: string;
    imageUrl?: string;
  };
  onBackToShelf: () => void;
  onSaved: (reflectionId: number) => void;
}

const WriteReflection: React.FC<WriteReflectionProps> = ({
  book,
  onBackToShelf,
  onSaved,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const { promptLogin } = useAuthPrompt();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Hopeful", "Reflective"]);
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((item) => item !== mood) : [...prev, mood],
    );
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    const minHeight = MIN_LINES * LINE_HEIGHT_REM * 16;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  };

  const handleSave = async () => {
    if (!body.trim()) {
      setError("Please write your reflection before saving.");
      return;
    }

    const auth = getStoredAuth();
    if (!auth?.token) {
      promptLogin({
        returnTo: location.pathname,
        title: "Sign in to save your reflection",
        message: "Sign in to save this reflection to your account.",
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saved = await createReflection({
        bookId: book.id,
        title: title.trim(),
        body: body.trim(),
        moods: selectedMoods,
        containsSpoilers,
        visibility,
        authorName: auth.fullName || auth.email,
      });
      onSaved(saved.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save reflection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-cream">
      <div className="paper-grain" />

      <div className="border-b border-primary/10 bg-background-dark/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBackToShelf}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              Shelf
            </button>
            <span className="text-primary/40">/</span>
            <span className="text-slate-100 font-medium">{book.title}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
          <div className="w-32 h-48 flex-shrink-0 relative">
            <div className="w-full h-full rounded-sm shadow-2xl border border-white/5 overflow-hidden">
              <img
                src={book.imageUrl ?? FALLBACK_COVER_URL}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== FALLBACK_COVER_URL) {
                    target.src = FALLBACK_COVER_URL;
                  }
                }}
              />
            </div>
          </div>
          <div className="flex-grow pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight mb-2">
              Reflection: {book.title}
            </h1>
            <p className="text-lg italic text-primary/70">How did this book leave you?</p>
          </div>
        </div>

        <section className="glass-card rounded-xl p-8 md:p-12 mb-12 shadow-inner">
          <div className="mb-12">
            <input
              className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-primary focus:ring-0 text-2xl md:text-3xl font-display text-primary placeholder:text-primary/30 p-0 pb-4 transition-colors outline-none"
              placeholder="Give your musings a name..."
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-12">
            <textarea
              ref={textareaRef}
              className="lined-paper w-full bg-transparent border-0 focus:ring-0 text-slate-100 placeholder:text-slate-400/30 min-h-[calc(12*2.75rem)] resize-none overflow-hidden outline-none"
              placeholder="Pour your thoughts onto the page..."
              rows={MIN_LINES}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onInput={resizeTextarea}
            />
          </div>

          <div className="mb-12 border-t border-white/5 pt-8">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-6 uppercase">
              Mood after reading
            </h3>
            <div className="flex flex-wrap gap-3">
              {MOODS.map((mood) => {
                const isActive = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-5 py-2 rounded-full border text-xs font-medium uppercase tracking-wider transition-all active:scale-95 ${
                      isActive
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-primary/20 text-primary/70 hover:border-primary hover:bg-primary/10"
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-300 mb-6">{error}</p>}

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-8 md:gap-12 flex-1">
              <div>
                <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 uppercase">
                  Contains spoilers?
                </h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    className="w-4 h-4 text-primary bg-transparent border-primary/50 focus:ring-offset-background-dark focus:ring-primary"
                    type="checkbox"
                    checked={containsSpoilers}
                    onChange={(e) => setContainsSpoilers(e.target.checked)}
                  />
                  <span className="text-base text-slate-100 group-hover:text-primary transition-colors">
                    Yes
                  </span>
                </label>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 uppercase">
                  Visibility
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={visibility === "public"}
                      className="w-4 h-4 text-primary bg-transparent border-primary/50 focus:ring-offset-background-dark focus:ring-primary shrink-0"
                      name="visibility"
                      type="radio"
                      value="public"
                      onChange={() => setVisibility("public")}
                    />
                    <div className="flex flex-col">
                      <span className="text-base text-slate-100 group-hover:text-primary transition-colors">
                        Public Reflection
                      </span>
                      <span className="text-xs text-slate-400 opacity-60">
                        Visible to the Afterwords community.
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={visibility === "private"}
                      className="w-4 h-4 text-primary bg-transparent border-primary/50 focus:ring-offset-background-dark focus:ring-primary shrink-0"
                      name="visibility"
                      type="radio"
                      value="private"
                      onChange={() => setVisibility("private")}
                    />
                    <div className="flex flex-col">
                      <span className="text-base text-slate-100 group-hover:text-primary transition-colors">
                        Private Musings
                      </span>
                      <span className="text-xs text-slate-400 opacity-60">
                        Only you can revisit these thoughts.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:pb-1 shrink-0 md:ml-auto">
              <Button
                variant="primary"
                icon="save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Reflection"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WriteReflection;
