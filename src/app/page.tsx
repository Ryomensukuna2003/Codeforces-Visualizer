"use client";
import Script from "next/script";

import { CodeforcesVisualizerComponent } from "../components/codeforces-visualizer";
export default function Home() {
  return (
    <div>
      <CodeforcesVisualizerComponent />
      {/* <Script
        src="https://plug-platform.devrev.ai/static/plug.js"
        onLoad={() => {
          (window as any).plugSDK.init({
            app_id: "DvRvStPZG9uOmNvcmU6ZHZydi1pbi0xOmRldm8vMjFGWDZnb3gySDpwbHVnX3NldHRpbmcvMV9ffHxfXzIwMjUtMDktMjQgMDY6NDM6MzQuMDMyMjY5MjQxICswMDAwIFVUQw==xlxendsDvRv",
          });
        }}
      /> */}
    </div>
  );
}
 