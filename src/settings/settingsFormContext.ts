/**
 * Provides accessors for different elements in the settings form.
 */
export default class SettingsFormContext {
  public static form(): HTMLFormElement {
    return this._getElement<HTMLFormElement>("settingsForm");
  }

  public static notionKeyInput(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("notionKey");
  }

  public static parentIDInput(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("parentID");
  }

  public static submitButton(): HTMLButtonElement {
    return this._getElement<HTMLButtonElement>("submitButton");
  }

  public static toast(): HTMLElement {
    return this._getElement<HTMLElement>("toast");
  }

  protected static _getElement<ElementType extends HTMLElement>(
    id: string,
  ): ElementType {
    const element = document.getElementById(id) as ElementType;
    if (!element) {
      throw new Error(`Can't find the ${id} element.`);
    }
    return element;
  }
}
