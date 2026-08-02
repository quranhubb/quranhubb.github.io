import { useEffect, useState } from "react";
import logoAsset from "@/assets/quranhubb-logo.png.asset.json";

const LINES = [
  "We are setting things up for you...",
  "Just another minute...",
  "Here you go..",
];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000);
    const t2 = setTimeout(() => setStep(2), 2000);
    const t3 = setTimeout(() => setLeaving(true), 3000);
    const t4 = setTimeout(onDone, 3500);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background ${
        leaving ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <img
        src={logoAsset.url}
        alt="Academy Logo"
        className="h-32 w-32 animate-logo-pulse object-contain"
      />
      <p key={step} className="mt-6 animate-rise text-sm text-muted-foreground">
        {LINES[step]}
      </p>
    </div>
  );
}
