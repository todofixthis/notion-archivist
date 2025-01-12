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

    // const blocks: BlockObjectRequest[] = [];

    // tokens.forEach((token: Token) => {
    //   let content: string;
    //
    //   switch (token.type) {
    //     case "heading":
    //       content = token.text?.trim();
    //
    //       if (content) {
    //         // Make heading property names explicit to avoid confusing TypeScript.
    //         if (token.depth === 1) {
    //           blocks.push({
    //             heading_1: {
    //               rich_text: [
    //                 {
    //                   text: { content },
    //                   type: "text",
    //                 },
    //               ],
    //             },
    //             object: "block",
    //             type: "heading_1",
    //           });
    //         } else if (token.depth === 2) {
    //           blocks.push({
    //             heading_2: {
    //               rich_text: [
    //                 {
    //                   text: { content },
    //                   type: "text",
    //                 },
    //               ],
    //             },
    //             object: "block",
    //             type: "heading_2",
    //           });
    //         } else if (token.depth === 3) {
    //           blocks.push({
    //             heading_3: {
    //               rich_text: [
    //                 {
    //                   text: { content },
    //                   type: "text",
    //                 },
    //               ],
    //             },
    //             object: "block",
    //             type: "heading_3",
    //           });
    //         }
    //       }
    //       break;
    //
    //     case "paragraph":
    //
    //       break;
    //
    //     // TODO bulleted and numbered lists
    //
    //     case "code":
    //       content = token.text?.trim();
    //
    //       if (content) {
    //         blocks.push({
    //           code: {
    //             language: token.lang || "plaintext",
    //             rich_text: [
    //               {
    //                 text: { content },
    //                 type: "text",
    //               },
    //             ],
    //           },
    //           object: "block",
    //           type: "code",
    //         });
    //       }
    //       break;
    //
    //     default:
    //       // Any unknown types are treated as generic paragraphs
    //       if (isTokenWithText(token)) {
    //         content = token.text?.trim();
    //
    //         if (content) {
    //           blocks.push({
    //             object: "block",
    //             paragraph: {
    //               rich_text: [
    //                 {
    //                   text: { content },
    //                   type: "text",
    //                 },
    //               ],
    //             },
    //             type: "paragraph",
    //           });
    //         }
    //       }
    //       break;
    //   }
    // });
    // return blocks;
  }

  // private static handleListItem(
  //   blocks: BlockObjectRequest[],
  //   token: Tokens.ListItem,
  //   depth: number,
  // ): void {
  //   const listBlock: BlockObjectRequest = {
  //     bulleted_list_item: {
  //       rich_text: [
  //         {
  //           text: { content: token.text || "" },
  //           type: "text",
  //         },
  //       ],
  //     },
  //     object: "block",
  //     type: "bulleted_list_item",
  //   };
  //
  //   // If the depth is greater than 1, we need to preserve the nesting.
  //   if (depth > 1) {
  //     let parent: BlockObjectRequest = blocks[blocks.length - 1];
  //     for (let i = 0; i <= depth - 1; i++) {
  //       if (parent.type === "bulleted_list_item") {
  //         if (!parent.bulleted_list_item.children) {
  //           parent.bulleted_list_item.children = [];
  //         }
  //         parent =
  //           parent.bulleted_list_item.children[
  //             parent.bulleted_list_item.children.length - 1
  //           ];
  //       }
  //     }
  //   }
  //
  //   return listBlock;
  // }

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
