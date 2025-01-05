import { isNotionClientError } from "@notionhq/client";
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
        try {
          await this.settingsService.setSettings(data);
        } catch (e: unknown) {
          if (isNotionClientError(e)) {
            return new Error(`Notion API Key: ${e.message}`);
          }
          throw e;
        }
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
