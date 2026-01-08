@Codebase
🚨 STRATEGIC PIVOT ORDER: STOP WIDGETS, START ASSETS

We are shifting our SEO Strategy based on an objective audit. The "Widget/Iframe" strategy is declared INVALID for this niche.

OBJECTIVE 1: KILL THE WIDGET (Stop Technical Debt)
- **Task**: Identify and REMOVE `EmbedButton` (iframe version) from all Client Components (`HomeClient`, `MagicCameraClient`, `StoryModeClient`).
- **Reason**: Parents/Teachers do not embed widgets. It is a high-risk (Penguin), low-reward feature. Remove the code bloat.

OBJECTIVE 2: BUILD THE LINK MAGNET (The "Statistics" Page)
- **Task**: Create a new page at `/statistics`.
- **Content**: Generate a `coloring-statistics.json` containing 50+ data points about "Child Development & Coloring" (e.g., "78% of teachers use coloring for focus").
- **Goal**: This page exists solely to be cited by educational bloggers. IT MUST BE INDEXABLE.
- **Action**: Add it to `sitemap.ts` and the main Navigation Header.

OBJECTIVE 3: THE "SHARE" BUTTON (100% Client-Side)
- **Task**: Create a `ShareEmbedButton` component.
- **Requirement**:
  1. NO backend API calls.
  2. Generates an HTML snippet: `<a href="..."><img src="..." alt="..."> Source: YourSite</a>`.
  3. This allows users to embed the IMAGE (which they actually want), not an iframe.

EXECUTE THIS PLAN IMMEDIATELY. NO ARGUMENTS.