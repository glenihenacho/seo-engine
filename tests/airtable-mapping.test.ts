import { describe, expect, it } from "vitest";

import { recordToClient } from "../tools/airtable-list-ready-clients.js";

describe("recordToClient", () => {
  it("maps a complete Greenlit record", () => {
    const client = recordToClient({
      id: "recABC",
      fields: {
        "Client Name": "Acme Co",
        "Brand Voice Guidelines": "Friendly and practical",
        "Audience Segments (Summary)": "Homeowners 35-65",
        Industry: "Home Services",
        "Services (Summary)": "Rooftop solar installation, battery storage",
        "Key Pain Points": "High electric bills, grid outages",
        "Forbidden Terms": "cheap, guaranteed savings",
        "Sanity Status": "Greenlit",
        "Sanity Dataset": "acme",
        "Is Ready for Gumloop (Any)": true,
        "Sanity Author Ref": "author-acme",
        "Dry Run": false,
      },
    });

    expect(client).toEqual({
      airtableRecordId: "recABC",
      name: "Acme Co",
      brandVoice: "Friendly and practical",
      audience: "Homeowners 35-65",
      industry: "Home Services",
      services: "Rooftop solar installation, battery storage",
      painPoints: "High electric bills, grid outages",
      forbiddenTerms: "cheap, guaranteed savings",
      sanityStatus: "Greenlit",
      sanityDataset: "acme",
      isReady: true,
      sanityAuthorRef: "author-acme",
      dryRun: false,
    });
  });

  it("defaults Dry Run to true when the Airtable field is unset", () => {
    const client = recordToClient({
      id: "recNODR",
      fields: {
        "Client Name": "X",
        "Brand Voice Guidelines": "y",
        "Audience Segments (Summary)": "z",
        "Sanity Status": "Off",
        "Sanity Dataset": "x",
        "Is Ready for Gumloop (Any)": false,
      },
    });
    expect(client.dryRun).toBe(true);
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

    expect(client.industry).toBe("");
    expect(client.services).toBe("");
    expect(client.painPoints).toBe("");
    expect(client.forbiddenTerms).toBe("");
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
