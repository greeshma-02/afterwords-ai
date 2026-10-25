export const ROUTES = {
  home: "/afterwords/home",
  shelf: "/afterwords/shelf",
  reflections: "/afterwords/reflections",
  signIn: "/afterwords/sign-in",
  signUp: "/afterwords/sign-up",
  privacy: "/afterwords/privacy",
  terms: "/afterwords/terms",
  book: (id: number | string) => `/afterwords/book/${id}`,
  writeReflection: (id: number | string) => `/afterwords/book/${id}/write-reflection`,
  reflection: (id: number | string) => `/afterwords/reflection/${id}`,
};
