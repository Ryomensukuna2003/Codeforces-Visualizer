"use-client";
import { CodeforcesVisualizerComponent } from "../components/codeforces-visualizer";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className='font-sans'>
      <CodeforcesVisualizerComponent></CodeforcesVisualizerComponent>
    </div>
  );
}
