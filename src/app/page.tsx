"use client";

import { useUsernameStore } from "@/components/Providers/contextProvider";
import { Landing } from "@/components/dossier/Landing";
import { CodeforcesVisualizerComponent } from "../components/codeforces-visualizer";

/**
 * `/` is two states of one route, not two routes: the cover sheet until there is
 * a handle, the dossier once there is. Keeping it on `/` is what lets a shared
 * `/?handle=…` link land on the thing it names, and keeps the canonical URL and
 * the share card pointing at one page.
 */
export default function Home() {
  const { username } = useUsernameStore() as unknown as { username: string };

  return username ? <CodeforcesVisualizerComponent /> : <Landing />;
}
