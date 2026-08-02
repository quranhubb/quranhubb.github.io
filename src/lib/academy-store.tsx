import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isRtl, translate, type Locale } from "@/lib/i18n";
import duasAsset from "@/assets/duas.pdf.asset.json";


export type Role = "student" | "teacher" | "owner";

export type User = {
  id: string;
  systemId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  provider?: "password" | "google";
  createdAt?: number;

};

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  at: number;
  blocked?: boolean;
  kind?: "text" | "voice";
};

export type Recording = {
  id: string;
  classId: string;
  kind: "video" | "audio";
  startedAt: number;
  duration: number;
  participants: string[];
  mediaUrl: string;
};

export type Incident = {
  id: string;
  at: number;
  actorSystemId: string;
  reason: string;
  excerpt: string;
  channel: "chat" | "transcript" | "voice";
  acknowledged?: boolean;
};

export type Theme = "light" | "dark" | "contrast";
export type Density = "comfy" | "compact";

export type CourseFile = {
  id: string;
  name: string;
  url?: string;
  size?: number;
  addedAt: number;
  builtin?: boolean;
};

export type AttendanceRow = {
  id: string;
  day: string;
  date: string;
  status: "present" | "absent";
  reason: string;
};

export type FeeRow = {
  id: string;
  month: string;
  paymentDate: string;
  status: "paid" | "unpaid";
};

export type ProgressRow = {
  id: string;
  date: string;
  lesson: string;
};

export type StudentRecord<T> = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: number;
  rows: T[];
};

export type JoinRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  at: number;
  status: "pending" | "accepted";
};

export type Settings = {
  autoStart: boolean;
  openInBackground: boolean;
  timeZone: string;
  locale: Locale;
  theme: Theme;
  density: Density;
  soundEnabled: boolean;
  toastEnabled: boolean;
  meetingSounds: boolean;
  micDevice: string;
  cameraDevice: string;
  speakerDevice: string;
  downloadPath: string;
  openLinksInApp: boolean;
  sidebarCollapsed: boolean;
  // privacy
  maskContactDetails: boolean;
  readReceipts: boolean;
  shareTypingIndicator: boolean;
  // accessibility
  fontScale: number;
  reduceMotion: boolean;
  captions: boolean;
  // people
  showOnlyAcademyContacts: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  autoStart: true,
  openInBackground: false,
  timeZone: "Asia/Karachi",
  locale: "en",
  theme: "light",
  density: "comfy",
  soundEnabled: true,
  toastEnabled: true,
  meetingSounds: true,
  micDevice: "Default - Headset Microphone",
  cameraDevice: "Integrated HD Webcam",
  speakerDevice: "Default - Headset Earphone",
  downloadPath: "C:\\Users\\Academy\\Downloads",
  openLinksInApp: true,
  sidebarCollapsed: false,
  maskContactDetails: true,
  readReceipts: true,
  shareTypingIndicator: true,
  fontScale: 100,
  reduceMotion: false,
  captions: true,
  showOnlyAcademyContacts: true,
};

const BUILTIN_FILES: CourseFile[] = [
  { id: "f-duas", name: "Duas PDF", url: duasAsset.url, addedAt: 0, builtin: true },
];

export type SignupAlert = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  at: number;
  read?: boolean;
};

type State = {
  users: User[];
  messages: Message[];
  recordings: Recording[];
  incidents: Incident[];
  signupAlerts: SignupAlert[];
  settings: Settings;
  adminPassword: string;
  files: CourseFile[];
  attendance: StudentRecord<AttendanceRow>[];
  fees: StudentRecord<FeeRow>[];
  progress: StudentRecord<ProgressRow>[];
  joinRequests: JoinRequest[];
  sessionUserId: string | null;
};

export const MASTER_PASSWORD = "mahnoorfatima123";

const EMPTY: State = {
  users: [],
  messages: [],
  recordings: [],
  incidents: [],
  signupAlerts: [],
  settings: DEFAULT_SETTINGS,
  adminPassword: MASTER_PASSWORD,
  files: BUILTIN_FILES,
  attendance: [],
  fees: [],
  progress: [],
  joinRequests: [],
  sessionUserId: null,
};

const KEY = "academy-state-v3";


const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";
const SAMPLE_AUDIO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

/* ---------------- DLP engine ---------------- */

const PHONE = /(?:\+?\d[\d\s\-().]{7,}\d)/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/i;
const SOCIAL =
  /(https?:\/\/)?(www\.)?(facebook|fb|instagram|insta|wa\.me|whatsapp|t\.me|telegram|snapchat|tiktok|twitter|x\.com|linkedin|discord)[.\w/]*/i;
const SPOKEN_DIGIT =
  /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine|double|triple)\b/gi;

function spokenNumberRun(text: string): boolean {
  const matches = text.match(SPOKEN_DIGIT);
  return Boolean(matches && matches.length >= 5);
}

export function scanForViolations(text: string): string | null {
  if (EMAIL.test(text)) return "Personal email address detected";
  if (PHONE.test(text.replace(/\b(19|20)\d{2}\b/g, ""))) return "Phone number detected";
  if (spokenNumberRun(text)) return "Spoken phone number detected in speech transcript";
  if (SOCIAL.test(text)) return "Social media / external contact link detected";
  return null;
}

/* ---------------- Table generators ---------------- */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const uid = () => Math.random().toString(36).slice(2, 10);

function buildAttendanceYear(): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  const start = new Date();
  for (let i = 0; i < 365; i += 1) {
    const d = new Date(start.getTime() + i * 86400000);
    rows.push({
      id: `a${i}`,
      day: DAY_NAMES[d.getDay()]!,
      date: d.toISOString().slice(0, 10),
      status: "present",
      reason: "",
    });
  }
  return rows;
}

function buildFeeYear(startDate: string): FeeRow[] {
  const base = startDate ? new Date(startDate) : new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate());
    return {
      id: `m${i}`,
      month: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      paymentDate: d.toISOString().slice(0, 10),
      status: i === 0 ? ("paid" as const) : ("unpaid" as const),
    };
  });
}

function buildProgressYear(): ProgressRow[] {
  const start = new Date();
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    return { id: `p${i}`, date: d.toISOString().slice(0, 10), lesson: "" };
  });
}

/* ---------------- Context ---------------- */

type Result = { ok: true } | { ok: false; error: string };

type Ctx = {
  state: State;
  hydrated: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  t: (key: string) => string;
  rtl: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  adminUnlocked: boolean;
  signUp: (input: Omit<User, "id" | "systemId">) => Result;
  signIn: (email: string, password: string) => Result;
  signInWithGoogle: (email: string, role: Role, name?: string) => Result;
  signOut: () => void;
  unlockAdmin: (password: string) => boolean;
  lockAdmin: () => void;
  changeAdminPassword: (current: string, next: string, confirm: string) => Result;
  sendMessage: (to: string, text: string, kind?: "text" | "voice") => Result;
  scanTranscript: (line: string) => Result;
  startSession: (kind: "video" | "audio", participants: string[]) => Recording;
  endSession: (id: string) => void;
  logIncident: (i: Omit<Incident, "id" | "at">) => void;
  acknowledgeIncidents: () => void;
  acknowledgeSignupAlerts: () => void;

  addFile: (file: { name: string; url?: string; size?: number }) => void;
  removeFile: (id: string) => void;
  addAttendanceStudent: (s: { name: string; phone: string; email: string }) => void;
  updateAttendanceRow: (studentId: string, rowId: string, patch: Partial<AttendanceRow>) => void;
  deleteAttendanceRow: (studentId: string, rowId: string) => void;
  deleteAttendanceStudent: (studentId: string) => void;
  addFeeStudent: (s: {
    name: string;
    phone: string;
    email: string;
    startDate: string;
  }) => void;
  updateFeeRow: (studentId: string, rowId: string, patch: Partial<FeeRow>) => void;
  deleteFeeRow: (studentId: string, rowId: string) => void;
  deleteFeeStudent: (studentId: string) => void;
  addProgressStudent: (s: { name: string; phone: string; email: string }) => void;
  updateProgressRow: (studentId: string, rowId: string, patch: Partial<ProgressRow>) => void;
  deleteProgressRow: (studentId: string, rowId: string) => void;
  deleteProgressStudent: (studentId: string) => void;
  requestToJoin: (toUserId: string) => void;
  acceptJoinRequest: (id: string) => void;
};

const AcademyContext = createContext<Ctx | null>(null);

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({
          ...EMPTY,
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
          // Always keep the built-in Quran & Qaida library present, plus any user uploads.
          files: [
            ...BUILTIN_FILES,
            ...(parsed.files ?? []).filter((f) => !f.builtin),
          ],
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  // Theme / language / accessibility side effects
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "contrast");
    if (state.settings.theme === "dark") root.classList.add("dark");
    if (state.settings.theme === "contrast") root.classList.add("contrast");
    root.classList.toggle("locale-ur", state.settings.locale === "ur");
    root.classList.toggle("locale-ar", state.settings.locale === "ar");
    root.classList.toggle("reduce-motion", state.settings.reduceMotion);
    root.lang = state.settings.locale;
    root.dir = isRtl(state.settings.locale) ? "rtl" : "ltr";
    root.style.fontSize = `${Math.round(state.settings.fontScale)}%`;
  }, [
    state.settings.theme,
    state.settings.locale,
    state.settings.reduceMotion,
    state.settings.fontScale,
  ]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const t = useCallback((key: string) => translate(state.settings.locale, key), [
    state.settings.locale,
  ]);

  const logIncident = useCallback((i: Omit<Incident, "id" | "at">) => {
    setState((s) => ({
      ...s,
      incidents: [{ ...i, id: uid(), at: Date.now() }, ...s.incidents],
    }));
  }, []);

  const acknowledgeIncidents = useCallback(() => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((i) => ({ ...i, acknowledged: true })),
    }));
  }, []);

  const acknowledgeSignupAlerts = useCallback(() => {
    setState((s) => ({
      ...s,
      signupAlerts: s.signupAlerts.map((a) => ({ ...a, read: true })),
    }));
  }, []);

  /** Registers a new account and raises a real-time alert for the Admin dashboard. */
  const registerUser = useCallback((user: User) => {
    setState((s) => ({
      ...s,
      users: [...s.users, user],
      signupAlerts: [
        {
          id: uid(),
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          at: user.createdAt ?? Date.now(),
        },
        ...s.signupAlerts,
      ],
      sessionUserId: user.id,
    }));
  }, []);

  // Verification-free authentication: sign the user straight in.
  const completeSignIn = useCallback((user: User) => {
    setState((s) => ({ ...s, sessionUserId: user.id }));
  }, []);

  const signUp: Ctx["signUp"] = useCallback(
    (input) => {
      if (input.role === "owner" && input.password !== state.adminPassword) {
        return { ok: false, error: "Access Denied: Invalid Owner Master Password" };
      }
      if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const prefix =
        input.role === "student" ? "Student" : input.role === "teacher" ? "Teacher" : "Owner";
      const count = state.users.filter((u) => u.role === input.role).length + 1;
      const user: User = {
        provider: "password",
        ...input,
        id: uid(),
        systemId: `${prefix} #${1041 + count}`,
        createdAt: Date.now(),
      };
      registerUser(user);
      return { ok: true };
    },
    [state.users, state.adminPassword, registerUser],
  );


  const signIn: Ctx["signIn"] = useCallback(
    (email, password) => {
      const account = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (account?.role === "owner" && password !== state.adminPassword) {
        return { ok: false, error: "Access Denied: Invalid Owner Master Password" };
      }
      if (!account || account.password !== password) {
        return { ok: false, error: "Invalid credentials. Please try again." };
      }
      completeSignIn(account);
      return { ok: true };
    },
    [state.users, state.adminPassword, completeSignIn],
  );

  const signInWithGoogle: Ctx["signInWithGoogle"] = useCallback(
    (email, role, name) => {
      const clean = email.trim().toLowerCase();
      if (!/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(clean)) {
        return { ok: false, error: "Select a Google account to continue." };
      }
      const existing = state.users.find((u) => u.email.toLowerCase() === clean);
      if (existing) {
        completeSignIn(existing);
        return { ok: true };
      }
      if (role === "owner") {
        return {
          ok: false,
          error: "Owner accounts must be created with the master password, not Google sign-in.",
        };
      }
      const prefix = role === "student" ? "Student" : "Teacher";
      const count = state.users.filter((u) => u.role === role).length + 1;
      const user: User = {
        id: uid(),
        systemId: `${prefix} #${1041 + count}`,
        name: name?.trim() || clean.split("@")[0] || "Google user",
        email: clean,
        phone: "",
        password: "",
        role,
        provider: "google",
        createdAt: Date.now(),
      };
      registerUser(user);
      return { ok: true };
    },
    [state.users, completeSignIn, registerUser],

  );

  const signOut = useCallback(() => {
    setState((s) => ({ ...s, sessionUserId: null }));
    setAdminUnlocked(false);
  }, []);

  const unlockAdmin = useCallback(
    (password: string) => {
      if (password === state.adminPassword) {
        setAdminUnlocked(true);
        return true;
      }
      logIncident({
        actorSystemId: currentUser?.systemId ?? "Unknown",
        reason: "Failed master password attempt on Admin Panel",
        excerpt: "•••••••••",
        channel: "chat",
      });
      return false;
    },
    [currentUser, logIncident, state.adminPassword],
  );

  const lockAdmin = useCallback(() => setAdminUnlocked(false), []);

  const changeAdminPassword: Ctx["changeAdminPassword"] = useCallback(
    (current, next, confirm) => {
      if (current !== state.adminPassword) {
        return { ok: false, error: "Current password is incorrect." };
      }
      if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
      if (next !== confirm) return { ok: false, error: "New passwords do not match." };
      setState((s) => ({
        ...s,
        adminPassword: next,
        users: s.users.map((u) => (u.role === "owner" ? { ...u, password: next } : u)),
      }));
      return { ok: true };
    },
    [state.adminPassword],
  );

  const sendMessage: Ctx["sendMessage"] = useCallback(
    (to, text, kind = "text") => {
      if (!currentUser) return { ok: false, error: "Not signed in." };
      const violation = scanForViolations(text);
      const msg: Message = {
        id: uid(),
        from: currentUser.id,
        to,
        text,
        at: Date.now(),
        blocked: Boolean(violation),
        kind,
      };
      setState((s) => ({
        ...s,
        messages: [...s.messages, msg],
        incidents: violation
          ? [
              {
                id: uid(),
                at: Date.now(),
                actorSystemId: currentUser.systemId,
                reason: violation,
                excerpt: text.slice(0, 80),
                channel: kind === "voice" ? "voice" : "chat",
              },
              ...s.incidents,
            ]
          : s.incidents,
      }));
      return violation ? { ok: false, error: violation } : { ok: true };
    },
    [currentUser],
  );

  const scanTranscript: Ctx["scanTranscript"] = useCallback(
    (line) => {
      const violation = scanForViolations(line);
      if (!violation) return { ok: true };
      logIncident({
        actorSystemId: currentUser?.systemId ?? "Unknown",
        reason: violation,
        excerpt: line.slice(0, 120),
        channel: "transcript",
      });
      return { ok: false, error: violation };
    },
    [currentUser, logIncident],
  );

  const startSession: Ctx["startSession"] = useCallback((kind, participants) => {
    const rec: Recording = {
      id: uid(),
      classId: `CLS-${Math.floor(1000 + Math.random() * 9000)}`,
      kind,
      startedAt: Date.now(),
      duration: 0,
      participants,
      mediaUrl: kind === "video" ? SAMPLE_VIDEO : SAMPLE_AUDIO,
    };
    setState((s) => ({ ...s, recordings: [rec, ...s.recordings] }));
    return rec;
  }, []);

  const endSession = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recordings: s.recordings.map((r) =>
        r.id === id ? { ...r, duration: Math.round((Date.now() - r.startedAt) / 1000) } : r,
      ),
    }));
  }, []);

  const addFile = useCallback((file: { name: string; url?: string; size?: number }) => {
    setState((s) => ({
      ...s,
      files: [...s.files, { ...file, id: uid(), addedAt: Date.now() }],
    }));
  }, []);

  const removeFile = useCallback((id: string) => {
    setState((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) }));
  }, []);

  /* ---- Academy tools CRUD ---- */

  const addAttendanceStudent: Ctx["addAttendanceStudent"] = useCallback((s0) => {
    setState((s) => ({
      ...s,
      attendance: [
        ...s.attendance,
        { ...s0, id: uid(), createdAt: Date.now(), rows: buildAttendanceYear() },
      ],
    }));
  }, []);

  const updateAttendanceRow: Ctx["updateAttendanceRow"] = useCallback((sid, rid, patch) => {
    setState((s) => ({
      ...s,
      attendance: s.attendance.map((st) =>
        st.id === sid
          ? { ...st, rows: st.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }
          : st,
      ),
    }));
  }, []);

  const deleteAttendanceRow: Ctx["deleteAttendanceRow"] = useCallback((sid, rid) => {
    setState((s) => ({
      ...s,
      attendance: s.attendance.map((st) =>
        st.id === sid ? { ...st, rows: st.rows.filter((r) => r.id !== rid) } : st,
      ),
    }));
  }, []);

  const deleteAttendanceStudent = useCallback((sid: string) => {
    setState((s) => ({ ...s, attendance: s.attendance.filter((st) => st.id !== sid) }));
  }, []);

  const addFeeStudent: Ctx["addFeeStudent"] = useCallback(({ startDate, ...rest }) => {
    setState((s) => ({
      ...s,
      fees: [
        ...s.fees,
        { ...rest, id: uid(), createdAt: Date.now(), rows: buildFeeYear(startDate) },
      ],
    }));
  }, []);

  const updateFeeRow: Ctx["updateFeeRow"] = useCallback((sid, rid, patch) => {
    setState((s) => ({
      ...s,
      fees: s.fees.map((st) =>
        st.id === sid
          ? { ...st, rows: st.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }
          : st,
      ),
    }));
  }, []);

  const deleteFeeRow: Ctx["deleteFeeRow"] = useCallback((sid, rid) => {
    setState((s) => ({
      ...s,
      fees: s.fees.map((st) =>
        st.id === sid ? { ...st, rows: st.rows.filter((r) => r.id !== rid) } : st,
      ),
    }));
  }, []);

  const deleteFeeStudent = useCallback((sid: string) => {
    setState((s) => ({ ...s, fees: s.fees.filter((st) => st.id !== sid) }));
  }, []);

  const addProgressStudent: Ctx["addProgressStudent"] = useCallback((s0) => {
    setState((s) => ({
      ...s,
      progress: [
        ...s.progress,
        { ...s0, id: uid(), createdAt: Date.now(), rows: buildProgressYear() },
      ],
    }));
  }, []);

  const updateProgressRow: Ctx["updateProgressRow"] = useCallback((sid, rid, patch) => {
    setState((s) => ({
      ...s,
      progress: s.progress.map((st) =>
        st.id === sid
          ? { ...st, rows: st.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }
          : st,
      ),
    }));
  }, []);

  const deleteProgressRow: Ctx["deleteProgressRow"] = useCallback((sid, rid) => {
    setState((s) => ({
      ...s,
      progress: s.progress.map((st) =>
        st.id === sid ? { ...st, rows: st.rows.filter((r) => r.id !== rid) } : st,
      ),
    }));
  }, []);

  const deleteProgressStudent = useCallback((sid: string) => {
    setState((s) => ({ ...s, progress: s.progress.filter((st) => st.id !== sid) }));
  }, []);

  const requestToJoin = useCallback(
    (toUserId: string) => {
      if (!currentUser) return;
      setState((s) =>
        s.joinRequests.some(
          (r) => r.fromUserId === currentUser.id && r.toUserId === toUserId,
        )
          ? s
          : {
              ...s,
              joinRequests: [
                ...s.joinRequests,
                {
                  id: uid(),
                  fromUserId: currentUser.id,
                  toUserId,
                  at: Date.now(),
                  status: "pending",
                },
              ],
            },
      );
    },
    [currentUser],
  );

  const acceptJoinRequest = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      joinRequests: s.joinRequests.map((r) =>
        r.id === id ? { ...r, status: "accepted" } : r,
      ),
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      settings: state.settings,
      updateSettings,
      t,
      rtl: isRtl(state.settings.locale),
      currentUser,
      isAdmin: currentUser?.role === "owner",
      adminUnlocked,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      unlockAdmin,
      lockAdmin,
      changeAdminPassword,
      sendMessage,
      scanTranscript,
      startSession,
      endSession,
      logIncident,
      acknowledgeIncidents,
      acknowledgeSignupAlerts,

      addFile,
      removeFile,
      addAttendanceStudent,
      updateAttendanceRow,
      deleteAttendanceRow,
      deleteAttendanceStudent,
      addFeeStudent,
      updateFeeRow,
      deleteFeeRow,
      deleteFeeStudent,
      addProgressStudent,
      updateProgressRow,
      deleteProgressRow,
      deleteProgressStudent,
      requestToJoin,
      acceptJoinRequest,
    }),
    [
      state,
      hydrated,
      updateSettings,
      t,
      currentUser,
      adminUnlocked,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      unlockAdmin,
      lockAdmin,
      changeAdminPassword,
      sendMessage,
      scanTranscript,
      startSession,
      endSession,
      logIncident,
      acknowledgeIncidents,
      acknowledgeSignupAlerts,

      addFile,
      removeFile,
      addAttendanceStudent,
      updateAttendanceRow,
      deleteAttendanceRow,
      deleteAttendanceStudent,
      addFeeStudent,
      updateFeeRow,
      deleteFeeRow,
      deleteFeeStudent,
      addProgressStudent,
      updateProgressRow,
      deleteProgressRow,
      deleteProgressStudent,
      requestToJoin,
      acceptJoinRequest,
    ],
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy() {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error("useAcademy must be used inside AcademyProvider");
  return ctx;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** Initials only, e.g. "Mahnoor Fatima" -> "MF". */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]!.toUpperCase());
  return letters.join("") || "U";
}

/** Role-safe short label, e.g. "Teacher: MF" — never leaks IDs, full names or contacts. */
export function displayLabel(user: Pick<User, "role" | "name">) {
  const prefix = user.role === "student" ? "Student" : user.role === "teacher" ? "Teacher" : "Admin";
  return `${prefix}: ${initialsOf(user.name)}`;
}

