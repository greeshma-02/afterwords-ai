export const ROUTES = {
  home: "/afterwords/home",
  reflections: "/afterwords/reflections",
  signIn: "/afterwords/sign-in",
  signUp: "/afterwords/sign-up",
  book: (id: number | string) => `/afterwords/book/${id}`,
  writeReflection: (id: number | string) => `/afterwords/book/${id}/write-reflection`,
  reflection: (id: number | string) => `/afterwords/reflection/${id}`,
};
