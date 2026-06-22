import { describe, expect, it } from "vitest";

import type { PostingWindow } from "../lib/models.js";
import { parsePostingWindows, pickSlot } from "../lib/posting-windows.js";

describe("parsePostingWindows", () => {
  it("parses a valid windows array", () => {
    const json = '[{"day":1,"start":"09:00","end":"17:00"},{"day":3,"start":"10:00","end":"12:00"}]';
    expect(parsePostingWindows(json)).toEqual([
      { day: 1, start: "09:00", end: "17:00" },
      { day: 3, start: "10:00", end: "12:00" },
    ]);
  });

  it("treats empty input as an empty array", () => {
    expect(parsePostingWindows("")).toEqual([]);
    expect(parsePostingWindows("   ")).toEqual([]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parsePostingWindows("not json")).toThrow();
  });

  it("throws on out-of-range day", () => {
    expect(() => parsePostingWindows('[{"day":7,"start":"09:00","end":"17:00"}]')).toThrow();
  });

  it("throws on malformed time", () => {
    expect(() => parsePostingWindows('[{"day":1,"start":"9","end":"17:00"}]')).toThrow();
  });
});

describe("pickSlot", () => {
  const monday9to17: PostingWindow = { day: 1, start: "09:00", end: "17:00" };

  it("returns a UTC datetime on the window's weekday", () => {
    const now = new Date(Date.UTC(2026, 5, 21, 0, 0, 0)); // Sunday
    const slot = pickSlot(monday9to17, now);
    expect(slot.getUTCDay()).toBe(1);
  });

  it("picks a whole hour in [startHour, endHour)", () => {
    const now = new Date(Date.UTC(2026, 5, 21, 0, 0, 0));
    for (let i = 0; i < 50; i++) {
      const slot = pickSlot(monday9to17, now);
      expect(slot.getUTCMinutes()).toBe(0);
      expect(slot.getUTCSeconds()).toBe(0);
      expect(slot.getUTCMilliseconds()).toBe(0);
      const hour = slot.getUTCHours();
      expect(hour).toBeGreaterThanOrEqual(9);
      expect(hour).toBeLessThan(17);
    }
  });

  it("uses the injected RNG to make hour deterministic", () => {
    const now = new Date(Date.UTC(2026, 5, 21, 0, 0, 0));
    const slot = pickSlot(monday9to17, now, () => 0);
    expect(slot.getUTCHours()).toBe(9);
    const upper = pickSlot(monday9to17, now, () => 0.999);
    expect(upper.getUTCHours()).toBe(16);
  });

  it("picks the next occurrence within 7 days", () => {
    const now = new Date(Date.UTC(2026, 5, 21, 0, 0, 0)); // Sun
    const slot = pickSlot(monday9to17, now, () => 0);
    const diffDays = (slot.getTime() - now.getTime()) / (24 * 3600 * 1000);
    expect(diffDays).toBeGreaterThan(0);
    expect(diffDays).toBeLessThan(7);
  });

  it("rolls to next week when the chosen hour is in the past today", () => {
    const sundayWindow: PostingWindow = { day: 0, start: "09:00", end: "17:00" };
    const now = new Date(Date.UTC(2026, 5, 21, 18, 0, 0)); // Sun 18:00
    const slot = pickSlot(sundayWindow, now);
    const diffDays = (slot.getTime() - now.getTime()) / (24 * 3600 * 1000);
    expect(diffDays).toBeGreaterThan(0);
    expect(slot.getUTCDay()).toBe(0);
  });

  it("throws on an inverted window", () => {
    expect(() =>
      pickSlot({ day: 1, start: "17:00", end: "09:00" }, new Date()),
    ).toThrow(/invalid window/);
  });
});
