import { describe, expect, it } from "vitest";

import { recordToClient } from "../tools/airtable-list-ready-clients.js";

describe("recordToClient", () => {
  it("maps a complete Greenlit record", () => {
    const client = recordToClient({
      id: "recABC",
      fields: {
        "Client Name": "Acme Co",
        "Brand Voice Guidelines": "Friendly and practical",
        "Target Keywords": ["solar panel installers", "home solar costs"],
        "Audience Segments (Summary)": "Homeowners 35-65",
        "Sanity Status": "Greenlit",
        "Sanity Dataset": "acme",
        "Is Ready for Gumloop (Any)": true,
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
      sanityDataset: "acme",
      isReady: true,
      sanityAuthorRef: "author-acme",
    });
  });

  it("parses keywords from a comma-separated string", () => {
    const client = recordToClient({
      id: "recXYZ",
      fields: {
        "Client Name": "B",
        "Brand Voice Guidelines": "v",
        "Target Keywords": "one, two , three",
        "Audience Segments (Summary)": "a",
        "Sanity Status": "Needs Review",
        "Sanity Dataset": "beta-co",
        "Is Ready for Gumloop (Any)": true,
      },
    });

    expect(client.targetKeywords).toEqual(["one", "two", "three"]);
    expect(client.sanityAuthorRef).toBeNull();
    expect(client.sanityStatus).toBe("Needs Review");
    expect(client.sanityDataset).toBe("beta-co");
  });

  it("treats missing optional fields as null/empty/false", () => {
    const client = recordToClient({
      id: "recEMPTY",
      fields: {
        "Client Name": "X",
        "Brand Voice Guidelines": "y",
        "Audience Segments (Summary)": "z",
        "Sanity Status": "Off",
        "Sanity Dataset": "x",
        "Is Ready for Gumloop (Any)": false,
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
          "Client Name": "X",
          "Brand Voice Guidelines": "y",
          "Audience Segments (Summary)": "z",
          "Sanity Status": "Pending",
          "Sanity Dataset": "x",
          "Is Ready for Gumloop (Any)": true,
        },
      }),
    ).toThrow(/Invalid Sanity Status/);
  });

  it("throws when Sanity Dataset is missing or empty", () => {
    expect(() =>
      recordToClient({
        id: "recNODATASET",
        fields: {
          "Client Name": "X",
          "Brand Voice Guidelines": "y",
          "Audience Segments (Summary)": "z",
          "Sanity Status": "Greenlit",
          "Is Ready for Gumloop (Any)": true,
        },
      }),
    ).toThrow(/Missing or empty Sanity Dataset/);
  });
});
