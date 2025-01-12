import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { Lexer, Token, Tokens } from "marked";

/**
 * Parses markdown content into Notion block objects.
 */
export default class MarkdownParser {
  public static blocksFromMarkdown(markdown: string): BlockObjectRequest[] {
    const lexer = new Lexer();
    const tokens = lexer.lex(markdown);

    return tokens.flatMap((token: Token): BlockObjectRequest[] => {
      switch (token.type) {
        case "heading":
          return this.parseHeading(token as Tokens.Heading);

        case "paragraph":
          return this.parseParagraph(token as Tokens.Paragraph);

        case "space":
          // Ignore these.
          return [];

        default:
          throw new Error(`Unparseable token: ${JSON.stringify(token)}`);
      }
    });
  }

  public static parseHeading(token: Tokens.Heading) {
    const content = token.text.trim();

    if (!content) {
      return [];
    }

    // Notion only supports headings up to level 3.
    return [
      token.depth > 3
        ? ({
            object: "block",
            paragraph: {
              rich_text: [
                {
                  annotations: { bold: true },
                  text: { content },
                  type: "text",
                },
              ],
            },
            type: "paragraph",
          } as BlockObjectRequest)
        : ({
            [`heading_${token.depth}`]: {
              rich_text: [
                {
                  text: { content },
                  type: "text",
                },
              ],
            },
            object: "block",
            type: `heading_${token.depth}`,
          } as BlockObjectRequest),
    ];
  }

  public static parseParagraph(token: Tokens.Paragraph): BlockObjectRequest[] {
    const content = token.text.trim();

    return content
      ? [
          {
            object: "block",
            paragraph: {
              rich_text: [
                {
                  text: { content },
                  type: "text",
                },
              ],
            },
            type: "paragraph",
          },
        ]
      : [];
  }
}
