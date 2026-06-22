import { z } from "zod";

import { PostingWindow } from "./models.js";

export function parsePostingWindows(json: string): PostingWindow[] {
  const trimmed = json.trim();
  if (trimmed.length === 0) return [];
  const parsed = JSON.parse(trimmed);
  return z.array(PostingWindow).parse(parsed);
}

export function pickSlot(
  window: PostingWindow,
  now: Date,
  rng: () => number = Math.random,
): Date {
  const startHour = Number(window.start.slice(0, 2));
  const endHour = Number(window.end.slice(0, 2));
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour) || endHour <= startHour) {
    throw new Error(`invalid window: start=${window.start} end=${window.end}`);
  }

  const hour = startHour + Math.floor(rng() * (endHour - startHour));

  const target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0, 0),
  );
  let dayDelta = (window.day - target.getUTCDay() + 7) % 7;
  if (dayDelta === 0 && target.getTime() <= now.getTime()) {
    dayDelta = 7;
  }
  target.setUTCDate(target.getUTCDate() + dayDelta);
  return target;
}
