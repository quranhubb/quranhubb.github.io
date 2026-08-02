import { useState } from "react";
import { Play, ShieldAlert, Users, Video, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDuration, useAcademy, type Recording } from "@/lib/academy-store";

type Tab = "users" | "recordings" | "incidents";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "recordings", label: "Recordings", icon: Video },
  { id: "incidents", label: "Incidents", icon: ShieldAlert },
];

export function AdminPanel() {
  const { state, lockAdmin } = useAcademy();
  const [tab, setTab] = useState<Tab>("users");
  const [playing, setPlaying] = useState<Recording | null>(null);
  const unresolved = state.incidents.length;

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h2 className="text-base font-semibold">Owner Admin Panel</h2>
          <p className="text-xs text-muted-foreground">
            Master-password protected · privacy &amp; compliance controls
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={lockAdmin}>
          <Lock className="mr-1.5 h-3.5 w-3.5" /> Lock panel
        </Button>
      </header>

      {unresolved > 0 && (
        <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-xs font-medium text-destructive">
          <ShieldAlert className="h-4 w-4" />
          Red Alert — {unresolved} data-loss prevention incident{unresolved > 1 ? "s" : ""} logged.
        </div>
      )}

      <nav className="flex gap-1 border-b border-border px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
              {t.id === "users"
                ? state.users.length
                : t.id === "recordings"
                  ? state.recordings.length
                  : state.incidents.length}
            </span>
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {tab === "users" &&
          (state.users.length === 0 ? (
            <Empty text="No registered users found" />
          ) : (
            <Table
              head={["Name", "Role", "Email", "Phone", "Registered"]}
              rows={state.users.map((u) => [
                u.name,
                u.role,
                u.email,
                u.phone,
                u.createdAt ? new Date(u.createdAt).toLocaleString() : "—",
              ])}
            />

          ))}

        {tab === "recordings" &&
          (state.recordings.length === 0 ? (
            <Empty text="No class recordings logged yet" />
          ) : (
            <ul className="space-y-3">
              {state.recordings.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Class {r.classId} · {r.kind === "video" ? "Video" : "Audio"} session
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.startedAt).toLocaleString()} · Duration{" "}
                      {r.duration ? formatDuration(r.duration) : "in progress"} · Participants:{" "}
                      {r.participants.join(", ")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setPlaying(r)}>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Play / View {r.kind === "video" ? "Video" : "Audio"} Recording
                  </Button>
                </li>
              ))}
            </ul>
          ))}

        {tab === "incidents" &&
          (state.incidents.length === 0 ? (
            <Empty text="No DLP incidents recorded" />
          ) : (
            <Table
              head={["Time", "Actor", "Channel", "Reason", "Excerpt"]}
              rows={state.incidents.map((i) => [
                new Date(i.at).toLocaleTimeString(),
                i.actorSystemId,
                i.channel,
                i.reason,
                i.excerpt,
              ])}
            />
          ))}
      </div>

      <Dialog open={Boolean(playing)} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class session playback</DialogTitle>
          </DialogHeader>
          {playing && (
            <div className="space-y-4">
              {playing.kind === "video" ? (
                <video src={playing.mediaUrl} controls className="w-full rounded-md bg-black" />
              ) : (
                <audio src={playing.mediaUrl} controls className="w-full" />
              )}
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <Meta label="Class ID" value={playing.classId} />
                <Meta label="Date / Time" value={new Date(playing.startedAt).toLocaleString()} />
                <Meta
                  label="Duration"
                  value={playing.duration ? formatDuration(playing.duration) : "in progress"}
                />
                <Meta label="Participant System IDs" value={playing.participants.join(", ")} />
              </dl>
              <p className="text-xs text-muted-foreground">
                Mixed track includes teacher and student audio channels.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
