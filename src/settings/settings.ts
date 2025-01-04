import {
  Client,
  isNotionClientError,
  NotionClientError,
} from "@notionhq/client";
import { z } from "zod";
import { attach, create, Handler } from "./frrm";
import SettingsFormContext from "./settingsFormContext";

const SettingsSchema = z.object({
  notionKey: z.string(),
  parentID: z.string(),
});

type SettingsData = z.infer<typeof SettingsSchema>;

/**
 * Accesses, validates, and stores settings for the extension.
 */
class SettingsManager {
  protected currentSettings?: SettingsData;
  protected readonly formHandler: Handler;

  public constructor() {
    this.formHandler = create({
      onBusy: "Saving...",
      onError: SettingsFormContext.toast(),
      onSubmit: async (data: SettingsData): Promise<boolean | Error> => {
        const newSettings: SettingsData = {
          notionKey: "",
          parentID: "",
        };

        const currentSettings = await this.getCurrentSettings();

        if (data.notionKey !== currentSettings?.notionKey) {
          if (data.notionKey) {
            const validationResult = await this.validateNotionKey(
              data.notionKey,
            );
            if (isNotionClientError(validationResult)) {
              return new Error(`Notion key: ${validationResult.message}`);
            }
          }
          newSettings.notionKey = data.notionKey;
        }

        if (data.parentID !== currentSettings?.parentID) {
          newSettings.parentID = data.parentID;
        }

        await browser.storage.sync.set(newSettings);
        return true;
      },
      schema: SettingsSchema,
    });
  }

  /**
   * Attach the form handler to a form.
   */
  public async attach(form: HTMLFormElement): Promise<void> {
    // Prefill form values.
    const currentSettings = await this.getCurrentSettings();
    SettingsFormContext.notionKeyInput().value = currentSettings.notionKey;
    SettingsFormContext.parentIDInput().value = currentSettings.parentID;

    // Attach form handler.
    attach(form, this.formHandler);
  }

  /**
   * Lazy-load the extension settings from local storage.
   */
  public async getCurrentSettings(): Promise<SettingsData> {
    this.currentSettings ||= (await browser.storage.sync.get()) as SettingsData;
    return this.currentSettings;
  }

  /**
   * Initialises a Notion API client.
   *
   * Note: assumes private integration (requires bearer token, not OAuth2).
   *
   * @param notionKey Notion integration secret key.
   * @protected
   */
  protected async getNotionClient(notionKey?: string): Promise<null | Client> {
    notionKey ||= (await this.getCurrentSettings()).notionKey;
    return notionKey ? new Client({ auth: notionKey }) : null;
  }

  /**
   * Validates the given Notion integration key.
   *
   * Note: assumes private integration (requires bearer token, not OAuth2).
   *
   * @param notionKey Notion integration secret key.
   * @protected
   */
  protected async validateNotionKey(
    notionKey: string,
  ): Promise<void | NotionClientError> {
    const notionClient = await this.getNotionClient(notionKey);
    if (!notionClient) {
      // `notionKey` is empty, so nothing to validate.
      return;
    }

    try {
      // Try to search for a page to verify the token.
      await notionClient.search({ query: "test", page_size: 1 });
    } catch (e: unknown) {
      if (isNotionClientError(e)) {
        return e;
      }
      throw e;
    }
  }
}

/**
 * Initialises the settings form when the page loads.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await new SettingsManager().attach(SettingsFormContext.form());
});
