import { PageContent } from "./types";

browser.runtime.onMessage.addListener(
    (message: string): Promise<PageContent> => {
      switch (message) {
        case "extractContent":
          return Promise.resolve({
            html: document.documentElement.outerHTML,
            url: document.location.href,
            ogImage: (
                document.querySelector('meta[property="og:image"]') as HTMLMetaElement
            )?.content
          })

        default:
          throw new Error(`Unexpected message ${JSON.stringify(message)}`)
      }

    }
)