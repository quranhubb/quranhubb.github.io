import { useState } from "react";
import { CalendarCheck, Pencil, Trash2, Wallet, BookOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAcademy } from "@/lib/academy-store";

type Tool = "attendance" | "fees" | "progress";

const TOOLS: { id: Tool; labelKey: string; icon: typeof CalendarCheck }[] = [
  { id: "attendance", labelKey: "attendance", icon: CalendarCheck },
  { id: "fees", labelKey: "feeTracker", icon: Wallet },
  { id: "progress", labelKey: "progress", icon: BookOpen },
];

export function AcademyTools() {
  const { t } = useAcademy();
  const [tool, setTool] = useState<Tool>("attendance");

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-panel">
      <header className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold">{t("academyTools")}</h2>
        <p className="text-xs text-muted-foreground">
          Admin-only registers for attendance, fees and student progress.
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 sm:px-4">
        {TOOLS.map((tl) => (
          <button
            key={tl.id}
            onClick={() => setTool(tl.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tool === tl.id
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tl.icon className="h-4 w-4" />
            {t(tl.labelKey)}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {tool === "attendance" && <AttendanceTool />}
        {tool === "fees" && <FeeTool />}
        {tool === "progress" && <ProgressTool />}
      </div>
    </section>
  );
}

function StudentForm({
  title,
  withDate,
  onSubmit,
}: {
  title: string;
  withDate?: boolean;
  onSubmit: (v: { name: string; phone: string; email: string; startDate: string }) => void;
}) {
  const [v, setV] = useState({
    name: "",
    phone: "",
    email: "",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (v.name.trim().length < 2) return setError("Enter the student name.");
    if (v.phone.trim().length < 7) return setError("Enter a valid phone number.");
    if (!/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(v.email.trim()))
      return setError("Enter a valid email address.");
    setError(null);
    onSubmit({ ...v, name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim() });
    setV({ name: "", phone: "", email: "", startDate: v.startDate });
  }

  return (
    <form
      onSubmit={submit}
      className="mb-5 space-y-3 rounded-lg border border-border bg-card p-4 shadow-teams"
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Student name" value={v.name} onChange={(x) => setV({ ...v, name: x })} />
        <Field label="Phone number" value={v.phone} onChange={(x) => setV({ ...v, phone: x })} />
        <Field label="Email" value={v.email} onChange={(x) => setV({ ...v, email: x })} />
        {withDate && (
          <div className="space-y-1.5">
            <Label>Due / paid start date</Label>
            <Input
              type="date"
              value={v.startDate}
              onChange={(e) => setV({ ...v, startDate: e.target.value })}
            />
          </div>
        )}
      </div>
      {error && (
        <p className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">{error}</p>
      )}
      <Button type="submit" size="sm">
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Generate 1-year table
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} maxLength={120} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Card({
  name,
  onDelete,
  children,
}: {
  name: string;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <p className="truncate text-sm font-semibold">{name}</p>
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete student record">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-[420px] overflow-auto">{children}</div>
    </div>
  );
}

const TH = "sticky top-0 bg-muted px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground";
const TD = "px-3 py-2 align-top text-sm";

function AttendanceTool() {
  const { state, addAttendanceStudent, updateAttendanceRow, deleteAttendanceRow, deleteAttendanceStudent } =
    useAcademy();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <StudentForm title="Add Student Attendance" onSubmit={(v) => addAttendanceStudent(v)} />
      {state.attendance.length === 0 && <Empty text="No attendance registers created yet" />}
      {state.attendance.map((st) => (
        <Card key={st.id} name={st.name} onDelete={() => deleteAttendanceStudent(st.id)}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Student", "Day", "Date", "Status", "Reason for absence", ""].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {st.rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className={TD}>{st.name}</td>
                  <td className={TD}>{r.day}</td>
                  <td className={TD}>{r.date}</td>
                  <td className={TD}>
                    <button
                      onClick={() =>
                        updateAttendanceRow(st.id, r.id, {
                          status: r.status === "present" ? "absent" : "present",
                        })
                      }
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "present"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {r.status === "present" ? "Present" : "Absent"}
                    </button>
                  </td>
                  <td className={TD}>
                    {editing === r.id ? (
                      <Input
                        autoFocus
                        value={r.reason}
                        maxLength={200}
                        onBlur={() => setEditing(null)}
                        onChange={(e) =>
                          updateAttendanceRow(st.id, r.id, { reason: e.target.value })
                        }
                      />
                    ) : (
                      <span className="text-muted-foreground">{r.reason || "—"}</span>
                    )}
                  </td>
                  <td className={TD}>
                    <RowActions
                      onEdit={() => setEditing(r.id)}
                      onDelete={() => deleteAttendanceRow(st.id, r.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </>
  );
}

function FeeTool() {
  const { state, addFeeStudent, updateFeeRow, deleteFeeRow, deleteFeeStudent } = useAcademy();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <>
      <StudentForm title="Add Student Fee" withDate onSubmit={(v) => addFeeStudent(v)} />
      {state.fees.length === 0 && <Empty text="No fee records created yet" />}
      {state.fees.map((st) => (
        <Card key={st.id} name={st.name} onDelete={() => deleteFeeStudent(st.id)}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Student", "Month", "Payment date", "Status", ""].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {st.rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className={TD}>{st.name}</td>
                  <td className={TD}>{r.month}</td>
                  <td className={TD}>
                    {editing === r.id ? (
                      <Input
                        autoFocus
                        type="date"
                        value={r.paymentDate}
                        onBlur={() => setEditing(null)}
                        onChange={(e) => updateFeeRow(st.id, r.id, { paymentDate: e.target.value })}
                      />
                    ) : (
                      r.paymentDate || "—"
                    )}
                  </td>
                  <td className={TD}>
                    <button
                      onClick={() =>
                        updateFeeRow(st.id, r.id, {
                          status: r.status === "paid" ? "unpaid" : "paid",
                        })
                      }
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "paid"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {r.status === "paid" ? "Paid" : "Unpaid"}
                    </button>
                  </td>
                  <td className={TD}>
                    <RowActions
                      onEdit={() => setEditing(r.id)}
                      onDelete={() => deleteFeeRow(st.id, r.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </>
  );
}

function ProgressTool() {
  const { state, addProgressStudent, updateProgressRow, deleteProgressRow, deleteProgressStudent } =
    useAcademy();
  const [editing, setEditing] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ name: string; date: string; lesson: string } | null>(null);

  return (
    <>
      <StudentForm title="Add Student Progress Log" onSubmit={(v) => addProgressStudent(v)} />
      {state.progress.length === 0 && <Empty text="No progress reports created yet" />}
      {state.progress.map((st) => (
        <Card key={st.id} name={st.name} onDelete={() => deleteProgressStudent(st.id)}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Student", "Date", "Lesson covered today", ""].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {st.rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className={TD}>{st.name}</td>
                  <td className={TD}>{r.date}</td>
                  <td className={TD}>
                    {editing === r.id ? (
                      <Input
                        autoFocus
                        value={r.lesson}
                        maxLength={2000}
                        onBlur={() => setEditing(null)}
                        onChange={(e) => updateProgressRow(st.id, r.id, { lesson: e.target.value })}
                      />
                    ) : (
                      <span className="flex items-start gap-2">
                        <span className="line-clamp-1 max-w-[28ch]">{r.lesson || "—"}</span>
                        {r.lesson.length > 40 && (
                          <button
                            onClick={() =>
                              setDetail({ name: st.name, date: r.date, lesson: r.lesson })
                            }
                            className="shrink-0 text-xs font-medium text-brand hover:underline"
                          >
                            View More
                          </button>
                        )}
                      </span>
                    )}
                  </td>
                  <td className={TD}>
                    <RowActions
                      onEdit={() => setEditing(r.id)}
                      onDelete={() => deleteProgressRow(st.id, r.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}

      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lesson detail</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <p className="text-xs text-muted-foreground">
                {detail.name} · {detail.date}
              </p>
              <p className="whitespace-pre-wrap">{detail.lesson}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="flex items-center gap-1">
      <button
        onClick={onEdit}
        aria-label="Edit row"
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete row"
        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
