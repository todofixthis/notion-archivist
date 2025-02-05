# TODO

- Create the page in Notion.
- Use the popup input values rather than the parsed article content (oops 😅).
- If the parent ID is entered as a URL, try to extract+save the ID instead.
- Validate parent ID when saving settings.
  - Can also use this as an opportunity to detect whether it is a database ID or a page
    ID.
  - Also need to figure out how to detect the title property for pages.
- Only create button click handlers once.
- Disable popup inputs/buttons whilst saving to Notion.
- Guide the user to the plugin settings if Notion API key and/or parent ID not set.
- Detect whether the parent ID is a database ID or a page ID.
  - Maybe do this when testing access?
- Integrate with Claude to remove promotional content/CTAs from the content?
  - Clean up title and byline (e.g. remove site name suffix).
- CI pipeline
- Add CD
- Configure renovatebot/dependabot.
- Cover image picker
- Autocompletion for parent page picker.
- Detect page properties when validating the parent ID and optionally assign values to
  these (e.g., if parent has `URL` property, user should be able to make it so that
  `article.url` automatically gets filled in when clicking the 'Save to Notion' button).

# Setup instructions

- Set up internal integration in Notion and copy secret key.
- How to get the parent database/page ID.
  - If you want a database ID, make sure you get the link to the database/view itself,
    not the page on which the database appears!
