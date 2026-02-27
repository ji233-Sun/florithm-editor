"use client";

import { WaveManagerForm } from "../waves/WaveManagerForm";
import { WaveTimeline } from "../waves/WaveTimeline";

export function WavesTab() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <WaveManagerForm />
      <WaveTimeline />
    </div>
  );
}
