"use client";
import { CodeforcesVisualizerComponent } from "../components/codeforces-visualizer";
import GridPattern from "@/components/ui/grid-pattern";
export default function Home() {
  return (
    <div className="font-sans">
      {/* <GridPattern />  */}
      <CodeforcesVisualizerComponent />
    </div>
  );
}
