/**
 * Manages toast notifications in a view.
 */
export default class ToastService {
  protected container: HTMLElement;
  protected toastHider: ReturnType<typeof setTimeout> | null;

  public constructor(container: HTMLElement) {
    this.container = container;
    this.toastHider = null;

    // Wire up the close button.
    this.container
      .querySelector("#toastCloseButton")!
      .addEventListener("click", (event: Event) => {
        event.preventDefault();

        if (this.toastHider !== null) {
          clearTimeout(this.toastHider);
        }

        this.container.classList.add("hidden");
      });
  }

  /**
   * Displays a toast notification.
   *
   * @param message Message to display. Specify empty string to hide the toast
   * notification.
   * @param error Whether the message indicates an error (`true`) or success (`false`).
   */
  public toast(message: string, error: boolean = true): void {
    if (this.toastHider !== null) {
      clearTimeout(this.toastHider);
    }

    this.container.classList[message === "" ? "add" : "remove"]("hidden");
    this.container.classList[error ? "remove" : "add"]("success");

    (this.container.querySelector('div[role="alert"]')! as HTMLElement).innerText =
      message;

    if (!error) {
      this.toastHider = setTimeout(() => this.container.classList.add("hidden"), 2000);
    }
  }
}
