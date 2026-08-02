import { useState } from "react";
import {
  ChevronDown,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  LayoutGrid,
  Video,
  VideoOff,
} from "lucide-react";

export type CallToolbarState = {
  camera: boolean;
  mic: boolean;
  sharing: boolean;
  chatOpen: boolean;
  view: "gallery" | "speaker";
};

export function CallToolbar({
  state,
  onChange,
  onLeave,
}: {
  state: CallToolbarState;
  onChange: (patch: Partial<CallToolbarState>) => void;
  onLeave: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-end gap-1 border-b border-border bg-card px-3 py-1.5">
      <ToolbarButton
        icon={MessageSquare}
        label="Chat"
        active={state.chatOpen}
        onClick={() => onChange({ chatOpen: !state.chatOpen })}
      />
      <ToolbarButton
        icon={LayoutGrid}
        label="View"
        active={state.view === "gallery"}
        onClick={() => onChange({ view: state.view === "gallery" ? "speaker" : "gallery" })}
      />
      <ToolbarButton
        icon={MoreHorizontal}
        label="More"
        active={moreOpen}
        onClick={() => setMoreOpen((v) => !v)}
      />

      <span className="mx-1 h-8 w-px bg-border" />

      <ToolbarButton
        icon={state.camera ? Video : VideoOff}
        label="Camera"
        active={state.camera}
        onClick={() => onChange({ camera: !state.camera })}
      />
      <Caret label="Camera options" />
      <ToolbarButton
        icon={state.mic ? Mic : MicOff}
        label="Mic"
        active={state.mic}
        boxed
        onClick={() => onChange({ mic: !state.mic })}
      />
      <Caret label="Mic options" />
      <ToolbarButton
        icon={MonitorUp}
        label="Share"
        active={state.sharing}
        onClick={() => onChange({ sharing: !state.sharing })}
      />

      <span className="mx-1 h-8 w-px bg-border" />

      <button
        onClick={onLeave}
        className="flex flex-col items-center gap-0.5 rounded px-3 py-1 text-[11px] text-destructive hover:bg-destructive/10"
      >
        <PhoneOff className="h-5 w-5" />
        Leave
      </button>

      {moreOpen && (
        <div className="absolute right-24 top-full z-20 mt-1 w-56 rounded-md border border-border bg-popover p-1 text-xs shadow-flyout">
          {[
            "Device settings",
            "Background effects",
            "Turn on live captions",
            "Meeting info",
            "Record and transcribe",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setMoreOpen(false)}
              className="block w-full rounded px-2.5 py-2 text-left hover:bg-accent"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  boxed,
  onClick,
}: {
  icon: typeof Mic;
  label: string;
  active?: boolean;
  boxed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-0.5 rounded px-3 py-1 text-[11px] transition-colors ${
        boxed ? "border border-border" : ""
      } ${active ? "text-foreground hover:bg-accent" : "text-muted-foreground hover:bg-accent"}`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function Caret({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      title={label}
      aria-label={label}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      className={`rounded p-1 text-muted-foreground hover:bg-accent ${open ? "bg-accent" : ""}`}
    >
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}
