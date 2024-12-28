import { Client } from "@notionhq/client";

class SettingsManager {
  private form: HTMLFormElement;
  private apiKeyInput: HTMLInputElement;
  private messageElement: HTMLElement;

  constructor() {
    this.form = document.getElementById("settingsForm") as HTMLFormElement;
    this.apiKeyInput = document.getElementById("notionKey") as HTMLInputElement;
    this.messageElement = document.getElementById(
      "validationMessage",
    ) as HTMLElement;
  }

  public async init(): Promise<void> {
    await this.initialiseForm();
    this.setupEventListeners();
  }

  private async initialiseForm(): Promise<void> {
    const { notionKey } = await browser.storage.sync.get("notionKey");
    if (notionKey) {
      this.apiKeyInput.value = notionKey;
    }
  }

  private setupEventListeners(): void {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  private async validateNotionKey(key: string): Promise<boolean> {
    const notion = new Client({ auth: key });
    // Try to search for a page to verify the token
    await notion.search({ query: "test", page_size: 1 });
    return true;
  }

  private showMessage(message: string, isError: boolean): void {
    this.messageElement.textContent = message;
    this.messageElement.className = `message ${isError ? "error" : "success"}`;
  }

  private async handleSubmit(): Promise<void> {
    const key = this.apiKeyInput.value.trim();

    if (!key) {
      this.showMessage("Please enter an API key", true);
      return;
    }

    try {
      await this.validateNotionKey(key);
      await browser.storage.sync.set({ notionKey: key });
      this.showMessage("Success", false);
    } catch (e: unknown) {
      this.showMessage(
        e instanceof Error ? e.message : JSON.stringify(e),
        true,
      );
    }
  }
}

// Initialize settings when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  await new SettingsManager().init();
});
