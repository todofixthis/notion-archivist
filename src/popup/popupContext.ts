/**
 * Provides accessors for different elements in the popup.
 */
class PopupContext {
  public static closeButton(): HTMLButtonElement {
    return this._getElement<HTMLButtonElement>("closeButton");
  }

  public static copyButton(): HTMLButtonElement {
    return this._getElement<HTMLButtonElement>("copyButton");
  }

  public static markdownContent(): HTMLTextAreaElement {
    return this._getElement<HTMLTextAreaElement>("markdownContent");
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
