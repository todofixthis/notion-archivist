import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import MarkdownParser from "./markdownParser";

describe("MarkdownParser Text Formatting", () => {
  describe("Basic Text and Paragraphs", () => {
    it("converts a simple paragraph", () => {
      const markdown = "This is a simple paragraph";

      const expected: BlockObjectRequest[] = [
        {
          object: "block",
          paragraph: {
            rich_text: [
              {
                text: { content: "This is a simple paragraph" },
                type: "text",
              },
            ],
          },
          type: "paragraph",
        },
      ];

      const result = MarkdownParser.blocksFromMarkdown(markdown);
      expect(result).toEqual(expected);
    });

    it("converts multiple paragraphs into separate blocks", () => {
      const markdown = "First paragraph\n\nSecond paragraph";

      const expected: BlockObjectRequest[] = [
        {
          object: "block",
          paragraph: {
            rich_text: [
              {
                text: { content: "First paragraph" },
                type: "text",
              },
            ],
          },
          type: "paragraph",
        },
        {
          object: "block",
          paragraph: {
            rich_text: [
              {
                text: { content: "Second paragraph" },
                type: "text",
              },
            ],
          },
          type: "paragraph",
        },
      ];

      const result = MarkdownParser.blocksFromMarkdown(markdown);
      expect(result).toEqual(expected);
    });

    it("is a no-op for empty input", () => {
      const markdown = "";
      const expected: BlockObjectRequest[] = [];

      const result = MarkdownParser.blocksFromMarkdown(markdown);
      expect(result).toEqual(expected);
    });

    it("is a no-op for whitespace-only input", () => {
      const markdown = "   \n   \n   ";
      const expected: BlockObjectRequest[] = [];

      const result = MarkdownParser.blocksFromMarkdown(markdown);
      expect(result).toEqual(expected);
    });
  });

  describe("Headings", () => {
    describe.each([{ level: 1 }, { level: 2 }, { level: 3 }])(
      "level-$level heading",
      ({ level }: { level: number }) => {
        it("parses as a header", () => {
          const markdown = `${"#".repeat(level)} What's new`;
          const expected: BlockObjectRequest[] = [
            {
              [`heading_${level}`]: {
                rich_text: [
                  {
                    text: { content: "What's new" },
                    type: "text",
                  },
                ],
              },
              object: "block",
              type: `heading_${level}`,
            } as BlockObjectRequest,
          ];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });

        it("ignores the heading if empty", () => {
          const markdown = `${"#".repeat(level)} `;
          const expected: BlockObjectRequest[] = [];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });

        it("ignores the heading if whitespace-only", () => {
          const markdown = `${"#".repeat(level)}   \t  `;
          const expected: BlockObjectRequest[] = [];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });
      },
    );

    describe.each([{ level: 4 }, { level: 5 }, { level: 6 }])(
      "level-$level heading",
      ({ level }: { level: number }) => {
        it("converts to bold-formatted text", () => {
          const markdown = `${"#".repeat(level)} What's new`;
          const expected: BlockObjectRequest[] = [
            {
              object: "block",
              paragraph: {
                rich_text: [
                  {
                    annotations: { bold: true },
                    text: { content: "What's new" },
                    type: "text",
                  },
                ],
              },
              type: "paragraph",
            },
          ];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });

        it("ignores the heading if empty", () => {
          const markdown = `${"#".repeat(level)} `;
          const expected: BlockObjectRequest[] = [];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });

        it("ignores the heading if whitespace-only", () => {
          const markdown = `${"#".repeat(level)}   \t  `;
          const expected: BlockObjectRequest[] = [];

          const result = MarkdownParser.blocksFromMarkdown(markdown);
          expect(result).toEqual(expected);
        });
      },
    );
  });
});
