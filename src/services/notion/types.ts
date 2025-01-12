import { Token, Tokens } from "marked";

export type TokenWithText = Extract<Token, { text: string }>;

export const isTokenWithText = (token: Token): token is TokenWithText =>
  (token as Tokens.Paragraph).text !== undefined;
