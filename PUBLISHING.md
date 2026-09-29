# Development → approved release → live

## Persistent rule

Development is local by default. Never push changes or run the publishing workflow
unless the user explicitly asks to publish/update the live game. The initial
GitHub Pages publication is authorized. itch.io public publication requires
separate approval of the final listing. Never overwrite the original development
files as part of publication.

## First setup (assistant performs the technical work)

1. Obtain normal authenticated GitHub access; the owner handles sign-in and 2FA.
2. Confirm the signed-in account and create a public repository named `briarhold`
   if available; do not replace any existing repository.
3. Initialize this folder as the repository, use the owner's configured commit
   identity, commit the reviewed files and add its GitHub remote. Never use a
   personal email or invented identity without a reason; GitHub's account-specific
   no-reply commit address is appropriate when available from account settings.
4. Configure Settings → Pages → Source to **GitHub Actions**. Do not configure
   branch-based automatic publication. Set the github-pages environment to allow
   releases from `main` only.
5. Push `main`, explicitly dispatch `Publish approved Briarhold version`, wait for
   success and verify the actual public URL in a browser.
6. Record the actual repo URL, public URL, deployed commit and date in this README
   and RELEASES.md; replace the pending website reference in the itch listing.
7. Tag the verified commit with a unique version such as `v1.0.0` and push the tag.

## Subsequent authorized releases

1. Inspect the current development files in sibling `../briarhold`. Run the
   workspace's `work/test-briarhold.cjs` and `work/check-briarhold-package.cjs`.
   Regenerate the standalone edition using `work/package-briarhold.cjs` if sources
   changed. Inspect the changes; preserve uncommitted work.
2. Fetch GitHub history; identify the last successful Pages deployment, not just
   the latest commit. Before a major release, preserve that known-good deployed
   commit with a unique release/backup tag. Never force-push or rewrite history.
3. Run `node tools/import-local.cjs` in this repository. This only copies the six
   approved game files and records their hashes. Review `git diff` against the
   last release. Do not include unrelated workspace files, credentials or logs.
4. Build with the actual public URL in `SITE_URL` and run `node tools/check.cjs`.
   Preview under a `/briarhold/` path, check start/movement/sword/pause/restart,
   console errors and the About page. Confirm metadata URLs and screenshot.
5. Commit with a useful description, push to `main`, and explicitly dispatch the
   manual workflow. An ordinary push must never be treated as a deployment.
6. Wait for Pages deployment success. Fetch public `release.json` and compare its
   commit with the intended commit. Open the public game, actually start and play,
   test controls, inspect browser errors, and check assets, sitemap and links.
7. Tag the verified release; record its deployed SHA/date/URL in RELEASES.md.
   Report success and the public game link. If verification fails, report that
   clearly and investigate or roll back rather than claiming success.

## Rollback

Use the last verified release tag to restore the game/web/media/tools files in a
new commit on `main`, preserving history and the manual-only deployment policy.
Review and test it, then manually publish and verify. Do not reset or force-push.

## Local preparation commands

Run from this folder with Node available:

```
node tools/import-local.cjs
node tools/build.cjs
node tools/check.cjs
```

Without SITE_URL the build uses a localhost preview URL. The workflow supplies
the real Pages URL automatically. `site/` and `itch-build/` are generated outputs,
not hand-edited sources. None of these three commands publishes anything.
