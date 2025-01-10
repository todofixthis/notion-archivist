import { isNotionClientError, NotionClientError } from "@notionhq/client";

/**
 * Indicates a configuration problem with the {@link NotionService} (most likely invalid
 * API key).
 */
export class ConfigurationError extends Error {}

export type NotionError = NotionClientError | ConfigurationError;

/**
 * Returns whether the specified value is related to Notion API or client.
 */
export const isNotionError = (e: unknown): e is NotionError =>
  isNotionClientError(e) || e instanceof ConfigurationError;
