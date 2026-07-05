import React from "react";

const JOURNAL_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDDdGfHLFkKbGlqdhGRuKU9XH6mchTp_kEAkfyOkdFIWSXhUvdCZRceiKaIcgbMbYpT0vbt9IReN9oYKBlK0WwXeHZinubQFNd-TIgaJ8DhwN900dqwyu1eLCYDHvD7oiancxjNL6WBuzQ8CWLVmB4Q6bjUpf8Nsg8dMXHnynCiOghLc4YDlii69ylh6cmtfqcURoMHvBP1i9djD46k5Kvs8Cuu8iDWEqXzY6j9-M1zfcc3EcXXd-JwA";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-paper-texture relative min-h-[calc(100vh-5rem)]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] auth-drift" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container/10 rounded-full blur-[150px] auth-drift"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      <main className="relative z-10 pt-12 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1440px] grid grid-cols-1 md:grid-cols-12 md:items-stretch gap-0 overflow-hidden rounded-xl shadow-2xl bg-surface-dark border border-white/5 auth-fade-in">
          <div className="hidden md:block md:col-span-5 relative journal-fold overflow-hidden min-h-[680px]">
            <img
              src={JOURNAL_IMAGE_URL}
              alt="A moody midnight study with an open journal, fountain pen, and candle"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 z-20">
              <p className="font-display text-[1.65rem] text-cream leading-relaxed mb-4 italic">
                &ldquo;The world is quiet here, between the ink and the mind.&rdquo;
              </p>
              <p className="text-xs uppercase tracking-widest text-primary font-sans font-bold">
                EST. 2023
              </p>
            </div>
          </div>

          <div className="col-span-1 md:col-span-7 p-10 md:p-14 lg:p-16 xl:p-20 flex flex-col justify-center bg-surface-container">
            <div className="max-w-2xl mx-auto w-full">{children}</div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-on-surface-variant opacity-60 font-sans">
          © 2026 Afterwords. Keep your thoughts safe.
        </p>
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
          <span className="text-[10px] text-primary uppercase tracking-tighter font-sans font-bold">
            Emotional Profile: Serene
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
