export const FALLBACK_COVER_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBH7CXaV-pWWPXQLlVSj2pfk8s52zmA_VH9uWJajzB-a_3QfQNmiiWqZriD9vy7s2pT5SZ-3yzMcMqCgXFGd8TS35m34mBrjstQ3ZoheAIxs0s0U17QwpZUtlix0SVBUUV_oqMdDxrSs8m0NAbskPkktLKt7dgkiXpWT5b0tBpMEnSr3vJ_MLEdOJo_2yAInH8v0tLFj4psaZo0VB24r_X53daTqn2WtcqR_KYax8UeRHzhfWDMWZNAV7-SYzkDH9GnkRN5G73T01UI";

export interface BookMoods {
  sadness?: number;
  comfort?: number;
  hope?: number;
  joy?: number;
  humor?: number;
  connection?: number;
  intensity?: number;
}

export function moodTags(book: BookMoods): string[] {
  const tags: string[] = [];
  if (book.comfort && book.comfort >= 4) tags.push("Comfort");
  if (book.sadness && book.sadness >= 4) tags.push("Melancholy");
  if (book.hope && book.hope >= 4) tags.push("Hopeful");
  if (book.joy && book.joy >= 4) tags.push("Joyful");
  if (book.humor && book.humor >= 4) tags.push("Humorous");
  if (book.connection && book.connection >= 4) tags.push("Friendship");
  if (book.intensity !== undefined && book.intensity <= 2) tags.push("Gentle");
  return tags.slice(0, 3);
}

export function formatRelativeDate(isoDate?: string | null): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  return `${Math.floor(days / 7)} weeks ago`;
}
