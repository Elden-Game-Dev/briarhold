# Verified public releases

## v1.0.0 — 29 September 2026

- Game: https://elden-game-dev.github.io/briarhold/
- Repository: https://github.com/Elden-Game-Dev/briarhold
- Release / rollback tag: https://github.com/Elden-Game-Dev/briarhold/releases/tag/v1.0.0
- Deployed commit: `1ce887e11d381c3c1d16d9165fa298acac23128d`
- Successful manual deployment: https://github.com/Elden-Game-Dev/briarhold/actions/runs/36522600711
- Pages source: GitHub Actions; only `main` is allowed by the Pages environment.
- Live HTML, CSS, renderer, game logic, About page, favicon, preview image and
  sitemap returned 200 and matched the prepared build byte for byte.
- Public release.json reports the correct deployed commit and source hashes.
- Browser check: game starts, accepts movement/attack input, pauses and resumes;
  no warning/error console entries. Local simulation separately verified all
  core mechanics and a complete victory route.

Documentation-only commits after this version do not change the live game.
## Google verification update — 29 September 2026

- Deployed commit: `a621ea9028d1934623eea18d897f54ccc60c79b4`
- Deployment: https://github.com/Elden-Game-Dev/briarhold/actions/runs/36543303180
- Added only the Google ownership meta tag to the site build; gameplay and graphics
  are unchanged. Public assets match the verified local build.
- Google ownership verified; main-page indexing request accepted; sitemap submitted. Initial fetch status requires
  follow-up (see DISCOVERABILITY.md). itch.io account setup remains pending.
- The v1.0.0 tag remains the original gameplay rollback point. When rolling back
  game files, preserve the verification tag to keep Search Console ownership.
