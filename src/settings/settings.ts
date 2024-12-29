import {
  Client,
  isNotionClientError,
  NotionClientError,
} from "@notionhq/client";
import { z } from "zod";
import { attach, create, Handler } from "./frrm";

const SettingsSchema = z.object({
  notionKey: z.optional(z.string()),
  parentPage: z.optional(z.string()),
});

type SettingsData = z.infer<typeof SettingsSchema>;

class SettingsManager {
  private readonly formHandler: Handler;

  public constructor() {
    this.formHandler = create({
      onBusy: "Saving...",
      onError: document.querySelector('[role="alert"]')! as HTMLElement,
      onSubmit: async (data: SettingsData): Promise<boolean | Error> => {
        const newData: SettingsData = {
          notionKey: "",
          parentPage: "",
        };

        if (data.notionKey) {
          const validationResult = await this.validateNotionKey(data.notionKey);
          if (isNotionClientError(validationResult)) {
            return validationResult;
          }
          newData.notionKey = data.notionKey;
        }

        if (data.parentPage) {
          newData.parentPage = data.parentPage;
        }

        await browser.storage.sync.set(newData);
        return true;
      },
      schema: SettingsSchema,
    });
  }

  public async attach(form: HTMLFormElement): Promise<void> {
    attach(form, this.formHandler);
  }

  private async validateNotionKey(
    key: string,
  ): Promise<void | NotionClientError> {
    const notion = new Client({ auth: key });
    try {
      // Try to search for a page to verify the token.
      await notion.search({ query: "test", page_size: 1 });
    } catch (e: unknown) {
      if (isNotionClientError(e)) {
        return e;
      }
      throw e;
    }
  }
}

// Initialize settings when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  const form: HTMLFormElement = document.getElementById(
    "settingsForm",
  ) as HTMLFormElement;

  if (!form) {
    throw new Error("Cannot find settings form in the DOM!");
  }

  await new SettingsManager().attach(form);
});
