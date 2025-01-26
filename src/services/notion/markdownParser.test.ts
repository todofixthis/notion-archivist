import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import MarkdownParser from "./markdownParser";

/**
 * @see https://github.com/markedjs/marked/blob/master/test/unit/Lexer.test.js
 */
describe("MarkdownParser Text Formatting", () => {
  describe.skip("Blockquotes", () => {
    // Placeholder
  });

  describe.skip("Line breaks", () => {
    // Placeholder
  });

  describe.skip("Code", () => {
    describe("Fenced/indented code block", () => {
      // Placeholder

      it("Passes through whitespace-only code blocks", () => {
        // Placeholder
        // Note: the Marked library has special logic for different cases of leading and
        // trailing whitespace. Refer to its unit tests for more information (the link
        // is at the top of this file).
      });
    });

    describe("Code span", () => {
      // Placeholder

      it("Passes through whitespace-only code spans", () => {
        // Placeholder
      });
    });
  });

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

      const actual = MarkdownParser.blocksFromMarkdown(markdown);
      expect(actual).toEqual(expected);
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

      const actual = MarkdownParser.blocksFromMarkdown(markdown);
      expect(actual).toEqual(expected);
    });

    it.skip("Handles bold-formatted text", () => {
      // Placeholder
    });

    it.skip("Handles italic-formatted text", () => {
      // Placeholder
    });

    it.skip("Handles strikethrough-formatted text", () => {
      // Placeholder
    });

    it("is a no-op for empty input", () => {
      const markdown = "";
      const expected: BlockObjectRequest[] = [];

      const actual = MarkdownParser.blocksFromMarkdown(markdown);
      expect(actual).toEqual(expected);
    });

    it("is a no-op for whitespace-only input", () => {
      const markdown = "   \n   \n   ";
      const expected: BlockObjectRequest[] = [];

      const actual = MarkdownParser.blocksFromMarkdown(markdown);
      expect(actual).toEqual(expected);
    });

    it.skip("Treats escaped tokens as plain text", () => {
      // Placeholder
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

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
        });

        it("ignores the heading if empty", () => {
          const markdown = `${"#".repeat(level)} `;
          const expected: BlockObjectRequest[] = [];

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
        });

        it("ignores the heading if whitespace-only", () => {
          const markdown = `${"#".repeat(level)}   \t  `;
          const expected: BlockObjectRequest[] = [];

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
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

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
        });

        it("ignores the heading if empty", () => {
          const markdown = `${"#".repeat(level)} `;
          const expected: BlockObjectRequest[] = [];

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
        });

        it("ignores the heading if whitespace-only", () => {
          const markdown = `${"#".repeat(level)}   \t  `;
          const expected: BlockObjectRequest[] = [];

          const actual = MarkdownParser.blocksFromMarkdown(markdown);
          expect(actual).toEqual(expected);
        });
      },
    );
  });

  describe.skip("Horizontal rule", () => {
    // Placeholder
  });

  describe.skip("HTML", () => {
    // Placeholder
  });

  describe.skip("Hyperlinks", () => {
    describe("Bare links", () => {
      // Placeholder `url` and `<url>`
    });

    describe("Inline links", () => {
      // Placeholder `[title](url)`
    });

    describe("Named links", () => {
      // Placeholder `[name]` with URL set in page footer ("Def" and "Link" tokens)

      it("Does its best if the link reference is invalid", () => {
        // Placeholder (what should it do for e.g. `[link]` where there's no def for `link`?)
      });
    });
  });

  describe.skip("Images", () => {
    // Placeholder
  });

  describe.skip("Lists", () => {
    describe("Checklists", () => {
      // Placeholder

      describe("Blocks within list items", () => {
        // Placeholder
      });
    });

    describe("Ordered lists", () => {
      // Placeholder

      describe("Blocks within list items", () => {
        // Placeholder
      });
    });

    describe("Unordered lists", () => {
      // Placeholder

      describe("Blocks within list items", () => {
        // Placeholder
      });
    });
  });

  describe.skip("Preformatted text", () => {
    // Placeholder
  });

  describe.skip("Tables", () => {
    // Placeholder
  });

  describe.skip("Whitespace", () => {
    // Placeholder
  });
});
