"use client";

import { useEffect, useState } from "react";
import changelogData from "@/content/changelog.json";

export type ChangelogEntry = {
  version: string;
  date: string;
  summary: string;
};

export const CHANGELOG_LAST_SEEN_KEY = "changelog-last-seen";

const MAX_ENTRIES = 10;

export function getChangelogEntries(maxEntries = MAX_ENTRIES): ChangelogEntry[] {
  return [...changelogData.entries]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, maxEntries);
}

export function getLatestChangelogVersion(): string | null {
  return getChangelogEntries(1)[0]?.version ?? null;
}

export function hasUnreadChangelog(): boolean {
  if (typeof window === "undefined") return false;

  const latest = getLatestChangelogVersion();
  if (!latest) return false;

  return localStorage.getItem(CHANGELOG_LAST_SEEN_KEY) !== latest;
}

export function markChangelogAsRead(): void {
  if (typeof window === "undefined") return;

  const latest = getLatestChangelogVersion();
  if (!latest) return;

  localStorage.setItem(CHANGELOG_LAST_SEEN_KEY, latest);
  window.dispatchEvent(new Event("changelog-read"));
}

export function formatChangelogDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function useChangelogUnread(): boolean {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const update = () => setHasUnread(hasUnreadChangelog());

    update();
    window.addEventListener("storage", update);
    window.addEventListener("changelog-read", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("changelog-read", update);
    };
  }, []);

  return hasUnread;
}
