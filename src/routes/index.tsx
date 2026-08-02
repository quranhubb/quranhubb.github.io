import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen } from "@/components/auth-screen";
import { SplashScreen } from "@/components/splash-screen";
import { TeamsApp } from "@/components/teams-app";
import { AcademyProvider, useAcademy } from "@/lib/academy-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuranHubb" },
      {
        name: "description",
        content:
          "Secure academy management workspace with chat, class recordings, DLP privacy controls and an owner admin panel.",
      },
      { property: "og:title", content: "QuranHubb" },
      {
        property: "og:description",
        content:
          "Secure academy management workspace with chat, class recordings, DLP privacy controls and an owner admin panel.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AcademyProvider>
      <Shell />
    </AcademyProvider>
  );
}

function Shell() {
  const [splash, setSplash] = useState(true);
  const { currentUser } = useAcademy();

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;
  if (!currentUser) return <AuthScreen />;
  return <TeamsApp />;
}
