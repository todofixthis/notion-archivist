import {
  Client,
  isNotionClientError,
  NotionClientError,
} from "@notionhq/client";
import debounce from "debounce";
import { z } from "zod";
import { attach, create, Handler } from "./frrm";

const SettingsSchema = z.object({
  notionKey: z.optional(z.string()),
  parentPage: z.optional(z.string()),
});

type SettingsData = z.infer<typeof SettingsSchema>;

class SettingsManager {
  protected currentSettings?: SettingsData;
  protected readonly formHandler: Handler;

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
    form
      .querySelector('input[name="parentPage"]')!
      .addEventListener(
        "keyup",
        debounce(this.parentPageAutocomplete.bind(this), 250),
      );
  }

  public async getCurrentSettings(): Promise<SettingsData> {
    this.currentSettings ||= await browser.storage.sync.get();
    return this.currentSettings;
  }

  protected async parentPageAutocomplete(event: Event): Promise<void> {
    const query = (event.target! as HTMLInputElement).value;
    if (!query) {
      return;
    }

    const notionClient = await this.getNotionClient();
    if (notionClient) {
      const searchResult = await notionClient.search({ query });

      // Example result:
      // {
      //  "object": "list",
      //  "results": [
      //    {
      //      "object": "database",
      //      "id": "3036a486-581f-467d-a44c-e5a465204351",
      //      "cover": null,
      //      "icon": {
      //        "type": "emoji",
      //        "emoji": "💡"
      //      },
      //      "created_time": "2022-01-07T00:29:00.000Z",
      //      "created_by": {
      //        "object": "user",
      //        "id": "49cbdd91-b8a3-4d60-9985-bee774edb925"
      //      },
      //      "last_edited_by": {
      //        "object": "user",
      //        "id": "49cbdd91-b8a3-4d60-9985-bee774edb925"
      //      },
      //      "last_edited_time": "2024-12-29T01:11:00.000Z",
      //      "title": [
      //        {
      //          "type": "text",
      //          "text": {
      //            "content": "Tech Leadership Articles from the Web",
      //            "link": null
      //          },
      //          "annotations": {
      //            "bold": false,
      //            "italic": false,
      //            "strikethrough": false,
      //            "underline": false,
      //            "code": false,
      //            "color": "default"
      //          },
      //          "plain_text": "Tech Leadership Articles from the Web",
      //          "href": null
      //        }
      //      ],
      //      "description": [],
      //      "is_inline": false,
      //      "properties": {
      //        "Created": {
      //          "id": "Twke",
      //          "name": "Created",
      //          "type": "created_time",
      //          "created_time": {}
      //        },
      //        "URL": {
      //          "id": "%7Dp%5B%5C",
      //          "name": "URL",
      //          "type": "rich_text",
      //          "rich_text": {}
      //        },
      //        "Name": {
      //          "id": "title",
      //          "name": "Name",
      //          "type": "title",
      //          "title": {}
      //        },
      //        "Social Media Blurb": {
      //          "id": "e69a8501-dd3d-4a27-bba0-1f59e2022d5d",
      //          "name": "Social Media Blurb",
      //          "type": "rich_text",
      //          "rich_text": {}
      //        }
      //      },
      //      "parent": {
      //        "type": "page_id",
      //        "page_id": "2c8e614e-ab73-4e09-aac9-b870fef16d65"
      //      },
      //      "url": "https://www.notion.so/3036a486581f467da44ce5a465204351",
      //      "public_url": "https://todofixthis.notion.site/3036a486581f467da44ce5a465204351",
      //      "archived": false,
      //      "in_trash": false
      //    },
      //    {
      //      "object": "page",
      //      "id": "8f5a4593-b969-4d40-98a8-e16df425d487",
      //      "created_time": "2023-04-26T01:56:00.000Z",
      //      "last_edited_time": "2023-04-26T01:58:00.000Z",
      //      "created_by": {
      //        "object": "user",
      //        "id": "49cbdd91-b8a3-4d60-9985-bee774edb925"
      //      },
      //      "last_edited_by": {
      //        "object": "user",
      //        "id": "49cbdd91-b8a3-4d60-9985-bee774edb925"
      //      },
      //      "cover": {
      //        "type": "file",
      //        "file": {
      // tslint:disable-next-line:max-line-length
      //          "url": "https://prod-files-secure.s3.us-west-2.amazonaws.com/f51ee77d-d427-4a0e-986f-8221a90f1a68/86ef194a-3e13-4873-88bb-b8e8ccae954a/0h6D7jlMoqbffLh0g.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241229%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241229T011227Z&X-Amz-Expires=3600&X-Amz-Signature=c7fd02c194682e853731fac2e4c7c11168873b8e1c550db38ad053cdbc222f68&X-Amz-SignedHeaders=host&x-id=GetObject",
      //          "expiry_time": "2024-12-29T02:12:27.710Z"
      //        }
      //      },
      //      "icon": null,
      //      "parent": {
      //        "type": "database_id",
      //        "database_id": "3036a486-581f-467d-a44c-e5a465204351"
      //      },
      //      "archived": false,
      //      "in_trash": false,
      //      "properties": {
      //        "Created": {
      //          "id": "Twke",
      //          "type": "created_time",
      //          "created_time": "2023-04-26T01:56:00.000Z"
      //        },
      //        "URL": {
      //          "id": "%7Dp%5B%5C",
      //          "type": "rich_text",
      //          "rich_text": [
      //            {
      //              "type": "text",
      //              "text": {
      //                "content": "https://medium.com/codex/unit-tests-slow-me-down-98a6bac41462",
      //                "link": {
      //                  "url": "https://medium.com/codex/unit-tests-slow-me-down-98a6bac41462"
      //                }
      //              },
      //              "annotations": {
      //                "bold": false,
      //                "italic": false,
      //                "strikethrough": false,
      //                "underline": false,
      //                "code": false,
      //                "color": "default"
      //              },
      //              "plain_text": "https://medium.com/codex/unit-tests-slow-me-down-98a6bac41462",
      //              "href": "https://medium.com/codex/unit-tests-slow-me-down-98a6bac41462"
      //            }
      //          ]
      //        },
      //        "Name": {
      //          "id": "title",
      //          "type": "title",
      //          "title": [
      //            {
      //              "type": "text",
      //              "text": {
      //                "content": "“",
      //                "link": null
      //              },
      //              "annotations": {
      //                "bold": false,
      //                "italic": false,
      //                "strikethrough": false,
      //                "underline": false,
      //                "code": false,
      //                "color": "default"
      //              },
      //              "plain_text": "“",
      //              "href": null
      //            },
      //            {
      //              "type": "text",
      //              "text": {
      //                "content": "Unit Tests Slow Me Down”",
      //                "link": null
      //              },
      //              "annotations": {
      //                "bold": true,
      //                "italic": false,
      //                "strikethrough": false,
      //                "underline": false,
      //                "code": false,
      //                "color": "default"
      //              },
      //              "plain_text": "Unit Tests Slow Me Down”",
      //              "href": null
      //           }
      //         ]
      //       },
      //       "Social Media Blurb": {
      //         "id": "e69a8501-dd3d-4a27-bba0-1f59e2022d5d",
      //         "type": "rich_text",
      //         "rich_text": []
      //       }
      //     },
      //     "url": "https://www.notion.so/Unit-Tests-Slow-Me-Down-8f5a4593b9694d4098a8e16df425d487",
      //     "public_url": "https://todofixthis.notion.site/Unit-Tests-Slow-Me-Down-8f5a4593b9694d4098a8e16df425d487"
      //   }
      // ],
      // "next_cursor": null,
      // "has_more": false,
      // "type": "page_or_database",
      // "page_or_database": {},
      // "request_id": "30e7c539-e92a-4f92-a4df-dc5441f6032c"
      // }

      // tslint:disable-next-line:no-console
      console.log(searchResult);
    }
  }

  protected async getNotionClient(notionKey?: string): Promise<null | Client> {
    notionKey ||= (await this.getCurrentSettings()).notionKey;
    return notionKey ? new Client({ auth: notionKey }) : null;
  }

  protected async validateNotionKey(
    notionKey: string,
  ): Promise<void | NotionClientError> {
    const notionClient = await this.getNotionClient(notionKey);
    if (!notionClient) {
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
