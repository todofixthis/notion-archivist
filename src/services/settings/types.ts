import { z } from "zod";

/**
 * Used to validate the values from the extension's settings form.
 */
export const SettingsSchema = z.object({
  notionKey: z.string(),
  parentID: z.string(),
});

/**
 * Models the structure of the extension settings that are stored in localStorage.
 */
export type SettingsData = z.infer<typeof SettingsSchema>;

/**
 * A generic interface for managing extension settings.
 */
export interface ISettingsService {
  /**
   * Lazy-load the extension settings from local storage.
   *
   * @param reload If `true`, force the extension to reload settings.
   */
  getSettings(reload?: boolean): Promise<SettingsData>;

  /**
   * Save settings into local storage.
   *
   * Note: This will overwrite all existing settings.
   *
   * @returns the persisted settings (should match the argument value).
   */
  setSettings(settings: SettingsData): Promise<SettingsData>;
}
