import { describe, expect, it } from "vitest";

import { recordToClient } from "../tools/airtable-list-ready-clients.js";

describe("recordToClient", () => {
  it("maps a complete Greenlit record", () => {
    const client = recordToClient({
      id: "recABC",
      fields: {
        Name: "Acme Co",
        "Brand Voice": "Friendly and practical",
        "Target Keywords": ["solar panel installers", "home solar costs"],
        Audience: "Homeowners 35-65",
        "Sanity Status": "Greenlit",
        "Is Ready for Gumloop": true,
        "Sanity Author Ref": "author-acme",
      },
    });

    expect(client).toEqual({
      airtableRecordId: "recABC",
      name: "Acme Co",
      brandVoice: "Friendly and practical",
      targetKeywords: ["solar panel installers", "home solar costs"],
      audience: "Homeowners 35-65",
      sanityStatus: "Greenlit",
      isReady: true,
      sanityAuthorRef: "author-acme",
    });
  });

  it("parses keywords from a comma-separated string", () => {
    const client = recordToClient({
      id: "recXYZ",
      fields: {
        Name: "B",
        "Brand Voice": "v",
        "Target Keywords": "one, two , three",
        Audience: "a",
        "Sanity Status": "Needs Review",
        "Is Ready for Gumloop": true,
      },
    });

    expect(client.targetKeywords).toEqual(["one", "two", "three"]);
    expect(client.sanityAuthorRef).toBeNull();
    expect(client.sanityStatus).toBe("Needs Review");
  });

  it("treats missing optional fields as null/empty/false", () => {
    const client = recordToClient({
      id: "recEMPTY",
      fields: {
        Name: "X",
        "Brand Voice": "y",
        Audience: "z",
        "Sanity Status": "Off",
        "Is Ready for Gumloop": false,
      },
    });

    expect(client.targetKeywords).toEqual([]);
    expect(client.isReady).toBe(false);
    expect(client.sanityStatus).toBe("Off");
    expect(client.sanityAuthorRef).toBeNull();
  });

  it("throws on an invalid Sanity Status value", () => {
    expect(() =>
      recordToClient({
        id: "recBAD",
        fields: {
          Name: "X",
          "Brand Voice": "y",
          Audience: "z",
          "Sanity Status": "Pending",
          "Is Ready for Gumloop": true,
        },
      }),
    ).toThrow(/Invalid Sanity Status/);
  });
});
