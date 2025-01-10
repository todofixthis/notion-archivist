/**
 * Provides accessors for different elements in the popup.
 */
export default class PopupContext {
  public static articleByline(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("articleByline");
  }

  public static articleContent(): HTMLTextAreaElement {
    return this._getElement<HTMLTextAreaElement>("articleMarkdownContent");
  }

  public static articleCoverURL(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("articleCoverURL");
  }

  public static articleTitle(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("articleTitle");
  }

  public static articleURL(): HTMLInputElement {
    return this._getElement<HTMLInputElement>("articleURL");
  }

  public static closeButton(): HTMLButtonElement {
    return this._getElement<HTMLButtonElement>("closeButton");
  }

  public static notionButton(): HTMLButtonElement {
    return this._getElement<HTMLButtonElement>("notionButton");
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
