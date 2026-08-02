import { useState } from "react";
import {
  Accessibility,
  Bell,
  Building2,
  CreditCard,
  FileText,
  KeyRound,
  Lock,
  Monitor,
  MessageSquare,
  Settings as SettingsIcon,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAcademy, type Density, type Theme } from "@/lib/academy-store";
import { LANGUAGES, type Locale } from "@/lib/i18n";

type Tab =
  | "general"
  | "appearance"
  | "chats"
  | "notifications"
  | "accounts"
  | "privacy"
  | "accessibility"
  | "devices"
  | "people"
  | "files"
  | "plans";

const TABS: { id: Tab; labelKey: string; icon: typeof SettingsIcon }[] = [
  { id: "general", labelKey: "general", icon: SettingsIcon },
  { id: "appearance", labelKey: "appearance", icon: Monitor },
  { id: "chats", labelKey: "chats", icon: MessageSquare },
  { id: "notifications", labelKey: "notifications", icon: Bell },
  { id: "accounts", labelKey: "accounts", icon: Building2 },
  { id: "privacy", labelKey: "privacy", icon: Lock },
  { id: "accessibility", labelKey: "accessibility", icon: Accessibility },
  { id: "devices", labelKey: "devices", icon: Video },
  { id: "people", labelKey: "people", icon: Users },
  { id: "files", labelKey: "filesLinks", icon: FileText },
  { id: "plans", labelKey: "plans", icon: CreditCard },
];

const TIME_ZONES = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Europe/London",
  "America/New_York",
];
const MICS = ["Default - Headset Microphone", "Realtek Audio Input", "USB Condenser Mic"];
const CAMERAS = ["Integrated HD Webcam", "Logitech C920", "OBS Virtual Camera"];
const SPEAKERS = ["Default - Headset Earphone", "Realtek Speakers", "HDMI Output"];

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { settings, updateSettings, currentUser, isAdmin, t } = useAcademy();
  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  function flash() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="border-b border-border px-5 py-3">
          <DialogTitle className="text-base">{t("settings")}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] min-h-[420px] flex-col sm:flex-row">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-60 sm:flex-col sm:gap-0.5 sm:overflow-y-auto sm:border-b-0 sm:border-r">
            {TABS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex shrink-0 items-center gap-2 rounded px-2.5 py-2 text-left text-xs font-medium transition-colors sm:w-full ${
                  tab === tb.id
                    ? "bg-brand-soft text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <tb.icon className="h-4 w-4 shrink-0" />
                {t(tb.labelKey)}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-y-auto p-5 text-sm">
            {tab === "general" && (
              <Section title={t("general")}>
                <Toggle
                  label="Auto-start application"
                  checked={settings.autoStart}
                  onChange={(v) => updateSettings({ autoStart: v })}
                />
                <Toggle
                  label="Open application in background"
                  checked={settings.openInBackground}
                  onChange={(v) => updateSettings({ openInBackground: v })}
                />
                <Select
                  label="Time zone"
                  value={settings.timeZone}
                  options={TIME_ZONES}
                  onChange={(v) => updateSettings({ timeZone: v })}
                />
                <p className="text-xs text-muted-foreground">
                  Current time: {new Date().toLocaleString("en-US", { timeZone: settings.timeZone })}
                </p>
                <div className="space-y-1.5">
                  <Label>App language</Label>
                  <select
                    value={settings.locale}
                    onChange={(e) => updateSettings({ locale: e.target.value as Locale })}
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Urdu renders in Jameel Noori Nastaleeq; Arabic uses a Naskh Arabic font.
                  </p>
                </div>
              </Section>
            )}

            {tab === "appearance" && (
              <Section title={t("appearance")}>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["light", "Light"],
                      ["dark", "Dark"],
                      ["contrast", "High contrast"],
                    ] as [Theme, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => updateSettings({ theme: id })}
                      className={`rounded-lg border-2 p-3 text-left text-xs font-medium transition-colors ${
                        settings.theme === id
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <span
                        className={`mb-2 block h-12 rounded ${
                          id === "light"
                            ? "bg-neutral-200"
                            : id === "dark"
                              ? "bg-neutral-800"
                              : "bg-black"
                        }`}
                      />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Theme applies instantly across the whole workspace.
                </p>
              </Section>
            )}

            {tab === "chats" && (
              <Section title={t("chats")}>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["comfy", "Comfy", "Roomy bubbles with avatars"],
                      ["compact", "Compact", "More messages per screen"],
                    ] as [Density, string, string][]
                  ).map(([id, label, desc]) => (
                    <button
                      key={id}
                      onClick={() => updateSettings({ density: id })}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        settings.density === id
                          ? "border-brand bg-brand-soft"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <span className="block text-xs font-semibold">{label}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <Toggle
                  label="Send read receipts"
                  checked={settings.readReceipts}
                  onChange={(v) => updateSettings({ readReceipts: v })}
                />
              </Section>
            )}

            {tab === "notifications" && (
              <Section title={t("notifications")}>
                <Toggle
                  label="Play notification sounds"
                  checked={settings.soundEnabled}
                  onChange={(v) => updateSettings({ soundEnabled: v })}
                />
                <Toggle
                  label="Show toast notifications"
                  checked={settings.toastEnabled}
                  onChange={(v) => updateSettings({ toastEnabled: v })}
                />
                <Toggle
                  label="Meeting start / end sounds"
                  checked={settings.meetingSounds}
                  onChange={(v) => updateSettings({ meetingSounds: v })}
                />
              </Section>
            )}

            {tab === "accounts" && (
              <Section title={t("accounts")}>
                <div className="rounded-md border border-border p-3 text-xs">
                  <p className="font-semibold">{currentUser?.name}</p>
                  <p className="mt-1 capitalize text-muted-foreground">
                    {currentUser?.role} account · QuranHubb Academy
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Organisation: QuranHubb Academy (single tenant). Contact details are masked by
                  academy policy.
                </p>

                {isAdmin && <AdminPasswordSection />}
              </Section>
            )}

            {tab === "privacy" && (
              <Section title={t("privacy")}>
                <Toggle
                  label="Mask personal contact details across the app"
                  checked={settings.maskContactDetails}
                  onChange={(v) => updateSettings({ maskContactDetails: v })}
                />
                <Toggle
                  label="Share typing indicator"
                  checked={settings.shareTypingIndicator}
                  onChange={(v) => updateSettings({ shareTypingIndicator: v })}
                />
                <p className="text-xs text-muted-foreground">
                  Real-time DLP scanning of chats, voice notes and call transcripts is always on and
                  cannot be disabled.
                </p>
              </Section>
            )}

            {tab === "accessibility" && (
              <Section title={t("accessibility")}>
                <div className="space-y-1.5">
                  <Label>Text size: {settings.fontScale}%</Label>
                  <input
                    type="range"
                    min={80}
                    max={140}
                    step={5}
                    value={settings.fontScale}
                    onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })}
                    className="w-full accent-[var(--brand)]"
                  />
                </div>
                <Toggle
                  label="Reduce motion and animations"
                  checked={settings.reduceMotion}
                  onChange={(v) => updateSettings({ reduceMotion: v })}
                />
                <Toggle
                  label="Turn on live captions in meetings"
                  checked={settings.captions}
                  onChange={(v) => updateSettings({ captions: v })}
                />
              </Section>
            )}

            {tab === "devices" && (
              <Section title={t("devices")}>
                <Select
                  label="Microphone"
                  value={settings.micDevice}
                  options={MICS}
                  onChange={(v) => updateSettings({ micDevice: v })}
                />
                <Select
                  label="Speaker"
                  value={settings.speakerDevice}
                  options={SPEAKERS}
                  onChange={(v) => updateSettings({ speakerDevice: v })}
                />
                <Select
                  label="Camera"
                  value={settings.cameraDevice}
                  options={CAMERAS}
                  onChange={(v) => updateSettings({ cameraDevice: v })}
                />
                <Button variant="outline" size="sm" onClick={flash}>
                  Make a test call
                </Button>
              </Section>
            )}

            {tab === "people" && (
              <Section title={t("people")}>
                <Toggle
                  label="Show only academy contacts"
                  checked={settings.showOnlyAcademyContacts}
                  onChange={(v) => updateSettings({ showOnlyAcademyContacts: v })}
                />
                <p className="text-xs text-muted-foreground">
                  Teachers and students are listed by role and name only — phone numbers and personal
                  emails are never displayed.
                </p>
              </Section>
            )}

            {tab === "files" && (
              <Section title={t("filesLinks")}>
                <div className="space-y-1.5">
                  <Label htmlFor="dl">Download location</Label>
                  <Input
                    id="dl"
                    value={settings.downloadPath}
                    maxLength={160}
                    onChange={(e) => updateSettings({ downloadPath: e.target.value })}
                  />
                </div>
                <Toggle
                  label="Open links in the app"
                  checked={settings.openLinksInApp}
                  onChange={(v) => updateSettings({ openLinksInApp: v })}
                />
              </Section>
            )}

            {tab === "plans" && (
              <Section title={t("plans")}>
                <div className="rounded-md border-2 border-brand bg-brand-soft p-3 text-xs">
                  <p className="font-semibold text-brand">Academy Pro — current plan</p>
                  <p className="mt-1 text-accent-foreground">
                    Unlimited classes, cloud recording, DLP compliance engine.
                  </p>
                </div>
                <div className="rounded-md border border-border p-3 text-xs">
                  <p className="font-semibold">Academy Enterprise</p>
                  <p className="mt-1 text-muted-foreground">
                    SSO, retention policies and audit export.
                  </p>
                  <Button size="sm" className="mt-3" onClick={flash}>
                    Upgrade
                  </Button>
                </div>
              </Section>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          {saved && <span className="mr-auto text-xs text-success">Settings applied</span>}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={flash}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminPasswordSection() {
  const { changeAdminPassword, t } = useAcademy();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    const res = changeAdminPassword(current, next, confirm);
    if (!res.ok) return setError(res.error);
    setError(null);
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border-2 border-brand/40 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold">
        <KeyRound className="h-4 w-4 text-brand" />
        {t("changeAdminPassword")}
      </p>
      <Input
        type="password"
        placeholder="Current password"
        value={current}
        maxLength={72}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Input
        type="password"
        placeholder="New password"
        value={next}
        maxLength={72}
        onChange={(e) => setNext(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        maxLength={72}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">{error}</p>
      )}
      {done && (
        <p className="rounded bg-success/10 px-2 py-1.5 text-xs text-success">
          Admin password updated.
        </p>
      )}
      <Button type="submit" size="sm">
        Update password
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-xs hover:bg-accent"
    >
      {label}
      <span
        className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-muted-foreground/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-card transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
