import { describe, expect, it } from "vitest";

import { recordToSchedule } from "../tools/airtable-list-active-schedules.js";

describe("recordToSchedule", () => {
  it("maps a complete active schedule", () => {
    const schedule = recordToSchedule({
      id: "recSCH1",
      fields: {
        "Schedule Name": "Acme – Blogs – Weekly",
        Client: ["recCLI1"],
        Type: "Blog",
        "Posts per week": 2,
        "Posting Windows":
          '[{"day":1,"start":"09:00","end":"17:00"},{"day":4,"start":"10:00","end":"12:00"}]',
        Active: true,
      },
    });

    expect(schedule).toEqual({
      airtableRecordId: "recSCH1",
      name: "Acme – Blogs – Weekly",
      clientRecordId: "recCLI1",
      type: "Blog",
      postsPerWeek: 2,
      postingWindows: [
        { day: 1, start: "09:00", end: "17:00" },
        { day: 4, start: "10:00", end: "12:00" },
      ],
      active: true,
    });
  });

  it("throws when Client link is missing", () => {
    expect(() =>
      recordToSchedule({
        id: "recSCH2",
        fields: {
          "Schedule Name": "Orphan",
          "Posting Windows": "[]",
          Active: true,
        },
      }),
    ).toThrow(/no linked Client/);
  });

  it("handles empty Posting Windows as an empty array", () => {
    const schedule = recordToSchedule({
      id: "recSCH3",
      fields: {
        "Schedule Name": "Empty",
        Client: ["recCLI2"],
        "Posting Windows": "",
        Active: false,
      },
    });
    expect(schedule.postingWindows).toEqual([]);
    expect(schedule.active).toBe(false);
  });
});
