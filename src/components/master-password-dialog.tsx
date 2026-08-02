import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAcademy } from "@/lib/academy-store";

export function MasterPasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { unlockAdmin } = useAcademy();
  const [password, setPassword] = useState("");
  const [rejected, setRejected] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (unlockAdmin(password)) {
      setPassword("");
      setRejected(false);
      onOpenChange(false);
      onSuccess();
    } else {
      setRejected(true);
      setPassword("");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setRejected(false);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Master password required</DialogTitle>
        </DialogHeader>
        {rejected && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Security alert: incorrect master password. This attempt has been logged.
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="master">Owner master password</Label>
            <Input
              id="master"
              type="password"
              autoFocus
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Verify &amp; unlock
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
