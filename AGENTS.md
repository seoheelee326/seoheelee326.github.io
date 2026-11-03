# Repository working agreement

## Site structure
- Static GitHub Pages portfolio; no package.json or build step currently exists.
- Artist homepage: index.html, styles.css, app.js, data/, assets/.
- elsdr-preview/ is a separate site area in this repository; subway-date/ is another area.
- Pages CMS configuration is .pages.yml. Preserve its content schema.
- README states that main is the GitHub Pages deployment branch.

## Working safely
- Inspect git status and the current branch before editing. Preserve unrelated user changes.
- Work on codex/<task> or claude/<task>, never directly on main.
- Use separate clones or Git worktrees for simultaneous editing. Never let two tools edit the same checkout concurrently.
- Limit edits to the requested site area. Do not copy elsdr-preview over the artist homepage.
- Do not change deployment, DNS, domains, .nojekyll, CMS configuration, or publish settings without a specific request.
- Do not merge, deploy, force-push, or delete branches without explicit user authorization.
- Never put API keys, GitHub tokens, passwords, private keys, or local account configuration in source or logs.
- Use the tools' own sign-in flows; this static site does not need OpenAI or Anthropic API keys.
- These instructions guide agents; they do not enforce GitHub branch protection.

## Verification and handoff
- Review git diff and changed file paths before committing.
- For site edits, serve the repository over localhost HTTP; opening file:// is insufficient for JSON fetches.
- Check the changed page at desktop and mobile widths, navigation, language switching where present, JSON loading, and browser console.
- If a runtime or check is unavailable, state that clearly. Do not invent passing results.
- Open a draft PR against main with scope, checks performed, and remaining issues.
- Reviewer should inspect the author's diff without making edits in that checkout.
- Report branch, commit, changed files, verification, and PR link for handoff.
