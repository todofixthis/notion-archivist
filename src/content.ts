import { PageContent } from "./types";

browser.runtime.onMessage.addListener(
    (message: string): Promise<PageContent> => {
      switch (message) {
        case "extractContent":
          return Promise.resolve({
            html: document.documentElement.outerHTML,
            ogImage: (
                document.querySelector('meta[property="og:image"]') as HTMLMetaElement
            )?.content,
            url: document.location.href,
          });

        default:
          throw new Error(`Unexpected message ${JSON.stringify(message)}`);
      }

    },
);
