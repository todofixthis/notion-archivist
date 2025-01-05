import {
  Client,
  isNotionClientError,
  NotionClientError,
} from "@notionhq/client";
import SettingsService, {
  SettingsData,
  SettingsSchema,
} from "../services/settingsService";
import ToastService from "../services/toastService";
import { attach, create, Handler, Message } from "./frrm";
import SettingsFormContext from "./settingsFormContext";

/**
 * Accesses, validates, and stores settings for the extension.
 */
class SettingsManager {
  protected readonly settingsService: SettingsService;
  protected readonly formHandler: Handler;

  public constructor() {
    this.settingsService = new SettingsService();

    const toast = new ToastService(SettingsFormContext.toast());

    this.formHandler = create({
      onBusy: (busy: boolean) => {
        const submitButton = SettingsFormContext.submitButton();
        submitButton.disabled = busy;
        submitButton.innerText = busy ? "Saving..." : "Save Settings";
      },
      onError: (error: Message) => {
        if (error.value) {
          toast.toast(error.value);
        }
      },
      onSubmit: async (data: SettingsData): Promise<boolean | Error> => {
        toast.toast("");

        const targetSettings: SettingsData = {
          ...(await this.settingsService.getSettings()),
        };

        if (data.notionKey !== targetSettings?.notionKey) {
          if (data.notionKey) {
            const validationResult = await this.validateNotionKey(
              data.notionKey,
            );
            if (isNotionClientError(validationResult)) {
              return new Error(`Notion key: ${validationResult.message}`);
            }
          }
          targetSettings.notionKey = data.notionKey;
        }

        targetSettings.parentID = data.parentID;

        // Commit changes.
        await this.settingsService.setSettings(targetSettings);
        toast.toast("Settings saved!", false);

        // Return `true` to reset form state.
        // See https://github.com/schalkventer/frrm/issues/1 for more info.
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
    const currentSettings = await this.settingsService.getSettings();

    SettingsFormContext.notionKeyInput().value = currentSettings.notionKey;
    SettingsFormContext.parentIDInput().value = currentSettings.parentID;

    // Attach form handler.
    attach(form, this.formHandler);
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
    notionKey ||= (await this.settingsService.getSettings()).notionKey;
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
  const form = SettingsFormContext.form();

  // The submit button has been moved to the header (i.e. outside the <form>), so we
  // need to wire it up manually.
  SettingsFormContext.submitButton().addEventListener(
    "click",
    (event: Event) => {
      event.preventDefault();

      // Note: call `requestSubmit`, **not** `submit()` (the latter bypasses the form's
      // event handler.
      form.requestSubmit();
    },
  );

  // Initialise the settings manager.
  await new SettingsManager().attach(form);
});
