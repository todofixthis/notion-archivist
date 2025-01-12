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
});
