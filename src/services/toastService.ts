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
        this.hide();
      });
  }

  /**
   * Hides the toast notification.
   */
  public hide(): void {
    if (this.toastHider !== null) {
      clearTimeout(this.toastHider);
    }

    this.container.classList.add("hidden");
  }

  /**
   * Displays the toast notification.
   *
   * @param message Message to display. Specify empty string to hide the toast
   * notification.
   * @param error Whether the message indicates an error (`true`) or success (`false`).
   * @param autoHide Whether to automatically hide the toast message after a delay.
   * Default value is `!error`.
   */
  public show(
    message: string | HTMLElement,
    error: boolean = true,
    autoHide: boolean | null = null,
  ): void {
    if (this.toastHider !== null) {
      clearTimeout(this.toastHider);
    }

    this.container.classList[message === "" ? "add" : "remove"]("hidden");
    this.container.classList[error ? "remove" : "add"]("success");

    const messageContainer = this.container.querySelector(
      'div[role="alert"]',
    )! as HTMLElement;

    if (message instanceof HTMLElement) {
      messageContainer.innerHTML = "";
      messageContainer.appendChild(message);
    } else {
      messageContainer.innerText = message;
    }

    if (autoHide || (autoHide === null && !error)) {
      this.toastHider = setTimeout(this.hide.bind(this), 2000);
    }
  }
}
