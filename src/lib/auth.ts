/* ============================================================
   Local workspace access — deliberately client-side.

   Credentials are hashed on-device (FNV-1a, demo-grade) and
   never leave the browser. This demonstrates the twin's privacy
   contract (§70 · T-3): data stays with its owner. It is NOT a
   production authentication system, and says so in the UI.
   ============================================================ */

export interface StoredUser {
  name: string;
  email: string;
  hash: string;
  createdAt: string;
  kind: "student" | "supervisor";
}

export interface SessionUser {
  name: string;
  email: string;
  kind: "student" | "supervisor";
  signedInAt: string;
}

const USERS_KEY = "dtcis.users.v1";
const SESSION_KEY = "dtcis.session.v1";

/* FNV-1a 32-bit — demo-grade hash, clearly labeled in the UI. */
export function hashPass(email: string, pass: string): string {
  const s = `${email.toLowerCase()}::${pass}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function findUser(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: StoredUser): void {
  localStorage.setItem(USERS_KEY, JSON.stringify([...getUsers(), user]));
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function createSession(user: StoredUser): SessionUser {
  const session: SessionUser = {
    name: user.name,
    email: user.email,
    kind: user.kind,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/* simple password strength: 0–4 */
export function passStrength(pass: string): number {
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
