import { ISettingsService, SettingsData } from "./types";

/**
 * Provides a sandbox for simulating different settings (e.g., to validate new
 * values that the user has entered into the extension's settings form).
 */
export class TemporarySettings implements ISettingsService {
  protected settings: SettingsData;

  public constructor(settings: Partial<SettingsData>) {
    this.settings = {
      notionKey: "",
      parentID: "",
      ...settings,
    };
  }

  public async getSettings(): Promise<SettingsData> {
    return this.settings;
  }

  public async setSettings(): Promise<SettingsData> {
    throw new Error("Cannot set settings in TemporarySettings");
  }
}
