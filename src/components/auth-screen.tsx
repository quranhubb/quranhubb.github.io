import { useCallback, useEffect, useState } from "react";
import { AlertCircle, UserPlus } from "lucide-react";
import logoAsset from "@/assets/quranhubb-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAcademy, type Role } from "@/lib/academy-store";

type Mode = "signin" | "signup";

type GoogleAccount = { email: string; name: string; picture?: string };

const DEVICE_ACCOUNTS_KEY = "quranhubb-google-accounts";
const GOOGLE_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

/** Accounts previously used to sign in from this device/browser. Never hardcoded. */
function readDeviceAccounts(): GoogleAccount[] {
  try {
    const raw = localStorage.getItem(DEVICE_ACCOUNTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as GoogleAccount[]) : [];
    return Array.isArray(parsed) ? parsed.filter((a) => a && typeof a.email === "string") : [];
  } catch {
    return [];
  }
}

function rememberDeviceAccount(account: GoogleAccount) {
  const next = [account, ...readDeviceAccounts().filter((a) => a.email !== account.email)].slice(
    0,
    5,
  );
  try {
    localStorage.setItem(DEVICE_ACCOUNTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function decodeGoogleCredential(jwt: string): GoogleAccount | null {
  try {
    const payload = JSON.parse(
      decodeURIComponent(
        atob(jwt.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join(""),
      ),
    ) as { email?: string; name?: string; picture?: string };
    if (!payload.email) return null;
    return {
      email: payload.email,
      name: payload.name || payload.email.split("@")[0]!,
      ...(payload.picture ? { picture: payload.picture } : {}),
    };
  } catch {
    return null;
  }
}

const GoogleMark = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.4 28.7a14.5 14.5 0 0 1 0-9.4l-7.8-6.1a24 24 0 0 0 0 21.6l7.8-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.3 2.2-6.4 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAcademy();
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as Role,
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signin") {
      const res = signIn(form.email, form.password);
      if (!res.ok) setError(res.error);
      return;
    }

    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(form.email.trim()))
      return setError("Please enter a valid email address.");
    if (form.phone.trim().length < 7) return setError("Please enter a valid phone number.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    const res = signUp({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
    });
    if (!res.ok) return setError(res.error);
  }

  const completeGoogle = useCallback(
    (account: GoogleAccount) => {
      const res = signInWithGoogle(account.email, form.role, account.name);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      rememberDeviceAccount(account);
      setGoogleOpen(false);
      setError(null);
    },
    [form.role, signInWithGoogle],
  );

  const ownerDenied = error === "Access Denied: Invalid Owner Master Password";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm animate-rise">
        <div className="flex flex-col items-center">
          <img src={logoAsset.url} alt="QuranHubb logo" className="h-20 w-20 object-contain" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">QuranHubb</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-teams">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-md bg-muted p-1 text-sm">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded px-3 py-1.5 font-medium transition-colors ${
                  mode === m
                    ? "bg-card text-brand shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {ownerDenied && (
            <div className="mb-4 flex items-start gap-2 rounded-md border-2 border-destructive bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Access Denied: Invalid Owner Master Password
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => set("name")(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                maxLength={120}
                onChange={(e) => set("email")(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  maxLength={24}
                  onChange={(e) => set("phone")(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => set("role")(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="owner">Owner / Administration</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                {form.role === "owner" ? "Owner master password" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={form.password}
                maxLength={72}
                onChange={(e) => set("password")(e.target.value)}
              />
              {form.role === "owner" && (
                <p className="text-[11px] text-muted-foreground">
                  Owner access requires the academy master password.
                </p>
              )}
            </div>

            {error && !ownerDenied && (
              <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setGoogleOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <GoogleMark />
            Continue with Google
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Signing in is instant — no verification codes required.
        </p>
      </div>

      <GoogleChooser open={googleOpen} onOpenChange={setGoogleOpen} onChoose={completeGoogle} />
    </main>
  );
}

function GoogleChooser({
  open,
  onOpenChange,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onChoose: (a: GoogleAccount) => void;
}) {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const stored = readDeviceAccounts();
    setAccounts(stored);
    setAdding(stored.length === 0);
    setEmail("");
    setName("");
    setError(null);
  }, [open]);

  // Real Google Identity Services account chooser when a client ID is configured.
  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return;
    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existing ?? Object.assign(document.createElement("script"), { src, async: true });
    if (!existing) document.head.appendChild(script);

    const init = () => {
      const google = (window as unknown as { google?: any }).google;
      if (!google?.accounts?.id) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          const account = decodeGoogleCredential(response.credential);
          if (account) onChoose(account);
        },
      });
      const target = document.getElementById("gsi-button");
      if (target) {
        google.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      }
    };

    if ((window as unknown as { google?: any }).google?.accounts?.id) init();
    else script.addEventListener("load", init, { once: true });
  }, [open, onChoose]);

  function addAccount(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(clean)) {
      return setError("Enter the email address of your Google account.");
    }
    onChoose({ email: clean, name: name.trim() || clean.split("@")[0]! });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <GoogleMark className="h-5 w-5" />
            Choose an account
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">to continue to QuranHubb</p>

        {GOOGLE_CLIENT_ID && <div id="gsi-button" className="mt-2 flex justify-center" />}

        {accounts.length > 0 && (
          <ul className="mt-1 divide-y divide-border rounded-md border border-border">
            {accounts.map((a) => (
              <li key={a.email}>
                <button
                  onClick={() => onChoose(a)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-accent"
                >
                  {a.picture ? (
                    <img src={a.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                      {a.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{a.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{a.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <form onSubmit={addAccount} className="mt-2 space-y-2">
            <Input
              type="email"
              placeholder="Google email address"
              autoComplete="email"
              value={email}
              maxLength={120}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Name (optional)"
              autoComplete="name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="sm">
              Continue
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-md border border-border px-3 py-3 text-left text-sm hover:bg-accent"
          >
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            Use another account
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
