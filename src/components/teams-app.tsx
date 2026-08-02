import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Search,
  MessageSquare,
  Phone,
  Video,
  ShieldCheck,
  Send,
  Plus,
  Minus,
  Square,
  X,
  LogOut,
  Mic,
  Settings as SettingsIcon,
  FolderOpen,
  Calendar as CalendarIcon,
  GraduationCap,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  CirclePlay,
  FileText,
  Trash2,
  Users,
  Eye,
  ArrowLeft,
  UserPlus,
  Copy,
} from "lucide-react";
import { QURANHUBB_LOGO_DATA_URI } from "@/assets/logo-inline";
import duasAsset from "@/assets/duas.pdf.asset.json";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AcademyTools } from "@/components/academy-tools";
import { AdminPanel } from "@/components/admin-panel";
import { CallToolbar, type CallToolbarState } from "@/components/call-toolbar";
import { MasterPasswordDialog } from "@/components/master-password-dialog";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { displayLabel, initialsOf, useAcademy, type Recording } from "@/lib/academy-store";

type Nav =
  | "activity"
  | "chat"
  | "calls"
  | "recordings"
  | "admin"
  | "files"
  | "calendar"
  | "tools";

const NAV: { id: Nav; labelKey: string; icon: typeof MessageSquare; ownerOnly?: boolean }[] = [
  { id: "activity", labelKey: "activity", icon: Bell },
  { id: "chat", labelKey: "chat", icon: MessageSquare },
  { id: "calls", labelKey: "calls", icon: Phone },
  { id: "recordings", labelKey: "recordings", icon: Video },
  { id: "files", labelKey: "files", icon: FolderOpen },
  { id: "calendar", labelKey: "calendar", icon: CalendarIcon },
  { id: "tools", labelKey: "academyTools", icon: GraduationCap, ownerOnly: true },
];

/** Pre-loaded academy material shipped with the workspace. */
const BUILTIN_LIBRARY: Record<string, string | undefined> = {
  "f-duas": duasAsset.url,
};


export function TeamsApp() {
  const {
    currentUser,
    adminUnlocked,
    signOut,
    state,
    acknowledgeIncidents,
    acknowledgeSignupAlerts,
    settings,
    updateSettings,
    t,
  } = useAcademy();
  const [nav, setNav] = useState<Nav>("chat");
  const [askMaster, setAskMaster] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!currentUser) return null;
  const isOwner = currentUser.role === "owner";
  const liveAlerts = state.incidents.filter((i) => !i.acknowledged);
  const newSignups = state.signupAlerts.filter((a) => !a.read);
  const collapsed = settings.sidebarCollapsed || isMobile;
  const navItems = NAV.filter((item) => !item.ownerOnly || isOwner);
  const activeNav: Nav = nav === "tools" && !isOwner ? "chat" : nav;

  function openAdmin() {
    if (adminUnlocked) setNav("admin");
    else setAskMaster(true);
  }

  return (
    <div className="flex h-screen flex-col bg-brand text-sm">
      {/* Title bar */}
      <div className="flex h-12 shrink-0 items-center gap-3 px-3 text-brand-foreground">
        <div className="flex items-center gap-2 pr-2">
          <img src={QURANHUBB_LOGO_DATA_URI} alt="QuranHubb logo" className="h-6 w-6 object-contain" />
          <span className="text-xs font-semibold">QuranHubb</span>
        </div>
        <div className="relative mx-auto hidden w-full max-w-md sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-foreground/70" />
          <input
            placeholder={t("search")}
            className="h-7 w-full rounded bg-brand-foreground/15 pl-8 pr-3 text-xs text-brand-foreground placeholder:text-brand-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground/40"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 text-xs font-medium text-brand-foreground/90">
            {displayLabel(currentUser)}
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            title={t("settings")}
            className="rounded p-1.5 hover:bg-brand-foreground/15"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={signOut}
            title={t("signOut")}
            className="rounded p-1.5 hover:bg-brand-foreground/15"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          {[Minus, Square, X].map((Icon, i) => (
            <span key={i} className="hidden rounded p-1.5 hover:bg-brand-foreground/15 md:inline">
              <Icon className="h-3 w-3" />
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-t-md bg-background">
        {/* Sidebar */}
        <nav
          className={`flex shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-muted py-2 transition-[width] duration-200 ${
            collapsed ? "w-16 items-center" : "w-52 px-2"
          }`}
        >
          {!isMobile && (
            <button
              onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}
              title={collapsed ? t("expand") : t("collapse")}
              aria-label={collapsed ? t("expand") : t("collapse")}
              className={`mb-1 flex items-center gap-2 rounded px-2 py-2 text-xs text-muted-foreground hover:bg-accent ${
                collapsed ? "justify-center" : ""
              }`}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <>
                  <PanelLeftClose className="h-5 w-5" />
                  {t("collapse")}
                </>
              )}
            </button>
          )}

          {navItems.map((item) => (
            <RailButton
              key={item.id}
              active={activeNav === item.id}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
              onClick={() => setNav(item.id)}
            />
          ))}
          {isOwner && (
            <RailButton
              active={activeNav === "admin"}
              icon={ShieldCheck}
              label={t("admin")}
              collapsed={collapsed}
              onClick={openAdmin}
            />
          )}
          <RailButton
            icon={UserPlus}
            label="Request to Join / Invite"
            collapsed={collapsed}
            onClick={() => setInviteOpen(true)}
          />
          <RailButton
            icon={SettingsIcon}
            label={t("settings")}
            collapsed={collapsed}
            onClick={() => setSettingsOpen(true)}
          />
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          {isOwner && newSignups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-brand/30 bg-brand-soft px-4 py-2 text-xs font-semibold text-brand">
              <UserPlus className="h-4 w-4" />
              New registration — {newSignups[0]?.name} ({newSignups[0]?.role}) signed up on{" "}
              {new Date(newSignups[0]!.at).toLocaleString()}
              {newSignups.length > 1 ? ` · +${newSignups.length - 1} more` : ""}
              <button
                onClick={openAdmin}
                className="ml-auto rounded border border-brand px-2 py-0.5 hover:bg-brand/10"
              >
                View people
              </button>
              <button
                onClick={acknowledgeSignupAlerts}
                className="rounded px-2 py-0.5 hover:bg-brand/10"
              >
                Dismiss
              </button>
            </div>
          )}

          {isOwner && liveAlerts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-destructive/40 bg-destructive/15 px-4 py-2 text-xs font-semibold text-destructive">
              <ShieldAlert className="h-4 w-4" />
              Security Alert — {liveAlerts.length} contact-sharing violation
              {liveAlerts.length > 1 ? "s" : ""} detected ({liveAlerts[0]?.reason}).
              <button
                onClick={openAdmin}
                className="ml-auto rounded border border-destructive px-2 py-0.5 hover:bg-destructive/20"
              >
                Review
              </button>
              <button
                onClick={acknowledgeIncidents}
                className="rounded px-2 py-0.5 hover:bg-destructive/20"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {activeNav === "chat" && <ChatView />}
            {activeNav === "calls" && <CallsView />}
            {activeNav === "recordings" && <RecordingsView />}
            {activeNav === "files" && <FilesView />}
            {activeNav === "calendar" && <CalendarView />}
            {activeNav === "tools" && isOwner && <AcademyTools />}
            {activeNav === "activity" && (
              <section className="flex min-w-0 flex-1 flex-col">
                <PaneHeader title={t("activity")} />
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {isOwner && state.signupAlerts.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {state.signupAlerts.slice(0, 10).map((a) => (
                        <li
                          key={a.id}
                          className="rounded-md border border-border bg-card px-4 py-3 text-xs"
                        >
                          <span className="font-medium text-brand">New sign-up</span> · {a.name} ·{" "}
                          {a.email} · {a.role} · {new Date(a.at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  )}
                  {state.incidents.length === 0 && state.signupAlerts.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                      No activity yet
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {state.incidents.slice(0, 10).map((i) => (
                        <li
                          key={i.id}
                          className="rounded-md border border-border bg-card px-4 py-3 text-xs"
                        >
                          <span className="font-medium text-destructive">Policy block</span> ·{" "}
                          {i.reason} · {i.channel} · {new Date(i.at).toLocaleTimeString()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}
            {activeNav === "admin" &&
              (adminUnlocked ? <AdminPanel /> : <LockedAdmin onUnlock={openAdmin} />)}
          </div>
        </div>
      </div>

      <MasterPasswordDialog
        open={askMaster}
        onOpenChange={setAskMaster}
        onSuccess={() => setNav("admin")}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

/* ------------------------- Invite ------------------------- */

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { currentUser } = useAcademy();
  const [copied, setCopied] = useState(false);
  const link =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/?invite=${encodeURIComponent(currentUser?.systemId ?? "academy")}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Request to Join / Invite</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Share this link so a student or teacher can request to join QuranHubb.
        </p>
        <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button asChild size="sm">
            <a
              href={`mailto:?subject=${encodeURIComponent("Join QuranHubb")}&body=${encodeURIComponent(link)}`}
            >
              Share by email
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


/* ------------------------- Files ------------------------- */

function FilesView() {
  const { state, addFile, removeFile, t } = useAcademy();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => addFile({ name: f.name, url: URL.createObjectURL(f), size: f.size }));
    e.target.value = "";
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      <PaneHeader title={t("files")} />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <ul className="space-y-2">
          {state.files.map((f) => {
            const url = f.url ?? BUILTIN_LIBRARY[f.id] ?? "";
            return (
              <li
                key={f.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-brand" />
                <button
                  type="button"
                  onClick={() => setPreview({ name: f.name, url })}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-medium hover:underline">
                    {f.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {f.builtin
                      ? "Academy library"
                      : `Added ${new Date(f.addedAt).toLocaleDateString()}`}
                    {f.size ? ` · ${(f.size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </span>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview({ name: f.name, url })}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  View PDF
                </Button>
                <Button asChild size="sm">
                  <a href={url} download={f.name}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    {t("download")}
                  </a>
                </Button>
                {!f.builtin && (
                  <button
                    onClick={() => removeFile(f.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                    aria-label="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <input ref={input} type="file" multiple hidden onChange={onPick} />
        <Button className="mt-5" onClick={() => input.current?.click()}>
          <Plus className="mr-1 h-4 w-4" />
          {t("addFiles")}
        </Button>
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-3 p-4">
          <DialogHeader className="pr-8">
            <DialogTitle className="truncate text-sm">{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <>
              <iframe
                src={preview.url}
                title={preview.name}
                className="min-h-0 w-full flex-1 rounded-md border border-border bg-muted"
              />
              <div className="flex justify-end">
                <Button asChild size="sm">
                  <a href={preview.url} download={preview.name}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    {t("download")}
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ------------------------- Recordings ------------------------- */

function RecordingsView() {
  const { state, t } = useAcademy();

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      <PaneHeader title={t("recordings")} />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {state.recordings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No recorded classes yet — start a call to record one.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {state.recordings.map((r) => (
              <article key={r.id} className="rounded-md border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <CirclePlay className="h-4 w-4 text-brand" />
                  {r.classId} · {r.kind === "video" ? "Video" : "Audio"} class
                </div>
                {r.kind === "video" ? (
                  <video src={r.mediaUrl} controls className="w-full rounded" preload="metadata" />
                ) : (
                  <audio src={r.mediaUrl} controls className="w-full" preload="metadata" />
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(r.startedAt).toLocaleString()} ·{" "}
                  {r.duration ? `${r.duration}s` : "in progress"} · {r.participants.length}{" "}
                  participants
                </p>
                <Button asChild size="sm" className="mt-3">
                  <a href={r.mediaUrl} download={`${r.classId}.mp4`}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    {t("download")}
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------- Calendar ------------------------- */

function CalendarView() {
  const { t, state } = useAcademy();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const events = useMemo(() => {
    if (!date) return [];
    const key = date.toISOString().slice(0, 10);
    const classes = [
      { time: "09:00", title: "Tajweed class" },
      { time: "17:00", title: "Nazra revision" },
    ];
    const recs = state.recordings
      .filter((r) => new Date(r.startedAt).toISOString().slice(0, 10) === key)
      .map((r) => ({
        time: new Date(r.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: `${r.classId} recorded ${r.kind} class`,
      }));
    return [...classes, ...recs];
  }, [date, state.recordings]);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      <PaneHeader title={t("calendar")} />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-6">
          <div className="rounded-md border border-border bg-card p-2">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </div>
          <div className="min-w-60 flex-1">
            <h3 className="text-sm font-semibold">
              {date ? date.toLocaleDateString(undefined, { dateStyle: "full" }) : "Select a day"}
            </h3>
            <ul className="mt-3 space-y-2">
              {events.map((e, i) => (
                <li
                  key={i}
                  className="rounded-md border border-border bg-card px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-brand">{e.time}</span> · {e.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function RailButton({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: typeof MessageSquare;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`relative flex w-14 flex-col items-center gap-1 rounded py-2 text-[10px] transition-colors ${
          active ? "bg-card text-brand shadow-sm" : "text-muted-foreground hover:bg-accent"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
        )}
        <Icon className="h-5 w-5" />
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-xs font-medium transition-colors ${
        active ? "bg-card text-brand shadow-sm" : "text-muted-foreground hover:bg-accent"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
      )}
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function PaneHeader({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack?: (() => void) | undefined;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold">
        {onBack && (
          <button onClick={onBack} aria-label="Back to chat list" className="rounded p-1 hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <span className="truncate">{title}</span>
      </h2>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}

/* ------------------------- Chat ------------------------- */

function ChatView() {
  const { state, currentUser, sendMessage, settings } = useAcademy();
  const isMobile = useIsMobile();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);
  const [newChat, setNewChat] = useState(false);
  const compact = settings.density === "compact";

  const others = useMemo(
    () => state.users.filter((u) => u.id !== currentUser?.id),
    [state.users, currentUser],
  );
  const active = others.find((u) => u.id === activeId) ?? null;
  const thread = state.messages.filter(
    (m) =>
      active &&
      currentUser &&
      ((m.from === currentUser.id && m.to === active.id) ||
        (m.from === active.id && m.to === currentUser.id)),
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    const res = sendMessage(active.id, draft.trim());
    setBlocked(res.ok ? null : res.error);
    setDraft("");
  }

  function sendVoiceNote() {
    if (!active) return;
    const transcript = "Voice note transcript: call me on zero three double one five seven nine two";
    const res = sendMessage(active.id, transcript, "voice");
    setBlocked(res.ok ? null : res.error);
  }

  return (
    <>
      <aside
        className={`flex w-full shrink-0 flex-col border-r border-border bg-panel md:w-72 ${
          isMobile && active ? "hidden" : "flex"
        }`}
      >
        <PaneHeader title="Chat">
          <button
            onClick={() => setNewChat((v) => !v)}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent"
            title="Start a new chat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </PaneHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {newChat && (
            <div className="mb-2 rounded-md border border-border p-2">
              <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
                Start a new chat ({others.length})
              </p>
              {others.length === 0 ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">No registered users found</p>
              ) : (
                others.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setActiveId(u.id);
                      setNewChat(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-xs hover:bg-accent"
                  >
                    <Avatar name={initialsOf(u.name)} />
                    {displayLabel(u)}
                  </button>
                ))
              )}
            </div>
          )}

          {others.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              No registered users found
            </p>
          ) : (
            others.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveId(u.id)}
                className={`flex w-full items-center gap-2.5 rounded px-2 text-left ${
                  compact ? "py-1" : "py-2"
                } ${activeId === u.id ? "bg-brand-soft" : "hover:bg-accent"}`}
              >
                <Avatar name={initialsOf(u.name)} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{displayLabel(u)}</span>
                  <span className="block truncate text-xs capitalize text-muted-foreground">
                    {u.role}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col bg-panel ${isMobile && !active ? "hidden" : "flex"}`}
      >
        {!active ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <PaneHeader
              title={displayLabel(active)}
              onBack={isMobile ? () => setActiveId(null) : undefined}
            >
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Personal contact details are hidden by policy
              </span>
            </PaneHeader>

            <div
              className={`min-h-0 flex-1 overflow-y-auto p-4 ${compact ? "space-y-1" : "space-y-3"}`}
            >
              {thread.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">No messages yet</p>
              )}
              {thread.map((m) => {
                const mine = m.from === currentUser?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 text-sm ${compact ? "py-1" : "py-2"} ${
                        m.blocked
                          ? "border border-destructive/40 bg-destructive/10 text-destructive"
                          : mine
                            ? "bg-brand-soft text-accent-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {m.blocked
                        ? `${m.kind === "voice" ? "Voice note" : "Message"} blocked by data-protection policy`
                        : m.text}
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {new Date(m.at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {blocked && (
              <p className="mx-4 mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Blocked: {blocked}. An incident log was sent to the Owner Admin Panel.
              </p>
            )}
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={draft}
                maxLength={1000}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Send voice note"
                title="Send voice note (scanned by DLP)"
                onClick={sendVoiceNote}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </section>
    </>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2);
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">
      {initials}
    </span>
  );
}

/* ------------------------- Calls ------------------------- */

const TRANSCRIPT_LINES = [
  "Teacher: Assalamu alaikum everyone, let's begin today's lesson.",
  "Student: Sir, I could not complete the last exercise.",
  "Student: You can reach me on zero three one two four five six seven eight",
  "Teacher: Please keep all contact off the call — continue with page twelve.",
];

function CallsView() {
  const { state, currentUser, startSession, endSession, scanTranscript, settings } = useAcademy();
  const [live, setLive] = useState<Recording | null>(null);
  const [toolbar, setToolbar] = useState<CallToolbarState>({
    camera: false,
    mic: true,
    sharing: false,
    chatOpen: false,
    view: "gallery",
  });
  const [transcript, setTranscript] = useState<{ line: string; flagged: boolean }[]>([]);
  const idx = useRef(0);

  const participants = state.users.slice(0, 6).map((u) => u.systemId);

  function start(kind: "video" | "audio") {
    idx.current = 0;
    setTranscript([]);
    setLive(startSession(kind, Array.from(new Set(participants))));
  }

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      const line = TRANSCRIPT_LINES[idx.current % TRANSCRIPT_LINES.length]!;
      idx.current += 1;
      const res = scanTranscript(line);
      setTranscript((t) => [...t.slice(-8), { line, flagged: !res.ok }]);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [live, scanTranscript]);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      {live ? (
        <>
          <CallToolbar
            state={toolbar}
            onChange={(patch) => setToolbar((t) => ({ ...t, ...patch }))}
            onLeave={() => {
              endSession(live.id);
              setLive(null);
            }}
          />
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto p-6">
              <div className="flex h-56 items-center justify-center rounded-lg bg-rail text-rail-foreground">
                {toolbar.camera && live.kind === "video" ? (
                  <Video className="h-10 w-10" />
                ) : (
                  <img
                    src={QURANHUBB_LOGO_DATA_URI}
                    alt="Academy"
                    className="h-24 w-24 rounded-full bg-card object-contain p-2"
                  />
                )}
              </div>
              <p className="mt-4 text-sm font-semibold">
                Live {live.kind} class · {live.classId} · {toolbar.view} view
              </p>
              <p className="mt-1 text-xs text-destructive">● Cloud recording &amp; transcription active</p>
              <p className="mt-1 text-xs text-muted-foreground">
                <Users className="mr-1 inline h-3 w-3" />
                {live.participants.length} participant(s) · Mic {toolbar.mic ? "on" : "muted"} ·{" "}
                {settings.micDevice}
                {toolbar.sharing ? " · Screen sharing" : ""}
              </p>

              <h4 className="mt-6 text-xs font-semibold">Live transcript (DLP monitored)</h4>
              <ul className="mt-2 space-y-1">
                {transcript.length === 0 && (
                  <li className="text-xs text-muted-foreground">Listening…</li>
                )}
                {transcript.map((t, i) => (
                  <li
                    key={i}
                    className={`rounded px-2 py-1 text-xs ${
                      t.flagged
                        ? "border border-destructive/40 bg-destructive/10 font-medium text-destructive"
                        : "bg-muted"
                    }`}
                  >
                    {t.flagged ? "⚠ Blocked — phone number spoken: " : ""}
                    {t.line}
                  </li>
                ))}
              </ul>
            </div>

            {toolbar.chatOpen && (
              <aside className="w-72 shrink-0 border-l border-border p-4">
                <h4 className="text-sm font-semibold">Meeting chat</h4>
                <p className="mt-2 text-xs text-muted-foreground">
                  Messages here are scanned by the DLP engine before delivery.
                </p>
              </aside>
            )}
          </div>
        </>
      ) : (
        <>
          <PaneHeader title="Calls" />
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-semibold">Start a class session</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Cloud recording is triggered and logged automatically when a session starts.
              </p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => start("video")}>
                  <Video className="mr-1.5 h-4 w-4" /> Start video class
                </Button>
                <Button variant="outline" onClick={() => start("audio")}>
                  <Phone className="mr-1.5 h-4 w-4" /> Start audio class
                </Button>
              </div>
            </div>

            <h3 className="mt-8 text-sm font-semibold">Session history</h3>
            {state.recordings.length === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
                No sessions recorded yet
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {state.recordings.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">{r.classId}</span> · {r.kind} ·{" "}
                    {new Date(r.startedAt).toLocaleString()} — playback available in the Admin
                    Recordings tab
                  </li>
                ))}
              </ul>
            )}
            {currentUser?.role === "owner" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Owner view: transcripts and incidents are mirrored to the Admin Panel.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function LockedAdmin({ onUnlock }: { onUnlock: () => void }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-panel">
      <ShieldCheck className="h-8 w-8 text-brand" />
      <p className="text-sm text-muted-foreground">Admin Panel is locked</p>
      <Button onClick={onUnlock}>Enter master password</Button>
    </section>
  );
}
