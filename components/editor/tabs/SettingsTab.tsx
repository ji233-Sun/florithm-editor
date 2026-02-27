"use client";

import { LevelMetadataForm } from "../settings/LevelMetadataForm";
import { ConflictBanner } from "../settings/ConflictBanner";
import { MissingModulesBanner } from "../settings/MissingModulesBanner";

export function SettingsTab() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <LevelMetadataForm />
      <MissingModulesBanner />
      <ConflictBanner />
    </div>
  );
}
