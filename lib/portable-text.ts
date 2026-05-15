import { randomUUID } from "node:crypto";

type Span = {
  _type: "span";
  _key: string;
  text: string;
  marks: never[];
};

type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: never[];
  children: Span[];
};

function shortKey(): string {
  return randomUUID().replaceAll("-", "").slice(0, 12);
}

export function markdownToPortableText(markdown: string): Block[] {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.map((paragraph) => {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(paragraph);
    let style = "normal";
    let text = paragraph;
    if (headingMatch) {
      const hashes = headingMatch[1] ?? "";
      const content = headingMatch[2] ?? "";
      style = `h${Math.min(hashes.length, 4)}`;
      text = content.trim();
    }

    return {
      _type: "block",
      _key: shortKey(),
      style,
      markDefs: [],
      children: [{ _type: "span", _key: shortKey(), text, marks: [] }],
    };
  });
}
