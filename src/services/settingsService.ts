import { z } from "zod";

export const SettingsSchema = z.object({
  notionKey: z.string(),
  parentID: z.string(),
});

export type SettingsData = z.infer<typeof SettingsSchema>;

/**
 * Provides access to extension settings.
 */
export default class SettingsService {
  protected settings: SettingsData | undefined;

  /**
   * Lazy-load the extension settings from local storage.
   *
   * @param reload If `true`, force the extension to reload settings.
   */
  public async getSettings(reload?: boolean): Promise<SettingsData> {
    if (reload) {
      this.settings = undefined;
    }

    this.settings ||= (await browser.storage.sync.get()) as SettingsData;
    return this.settings;
  }

  /**
   * Save settings into local storage.
   *
   * Note: This will overwrite all existing settings.
   *
   * @returns the persisted settings (should match the argument value).
   */
  public async setSettings(settings: SettingsData): Promise<SettingsData> {
    await browser.storage.sync.set(settings);
    return this.getSettings(true);
  }
}
