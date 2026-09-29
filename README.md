# The Beacon of Briarhold

A free, single-player 3D browser adventure. Explore a storybook valley, recover
three Dawn Sigils, defeat the Hollow Warden and restore the castle beacon.

**Play:** https://elden-game-dev.github.io/briarhold/

**Repository:** https://github.com/Elden-Game-Dev/briarhold

Version **v1.0.0** was deployed and checked in a browser on 29 September 2026.
See [RELEASES.md](RELEASES.md) for the verified deployed commit and rollback point.

## Play locally

Open `game/Play Briarhold.html` in a desktop browser with WebGL 2 support.
No installation, internet, account, database or server is needed to play.

WASD / arrows move; Space swings the sword; Shift dodges; E interacts;
P / Escape pauses. Sound can be toggled on screen. There are no touch controls
or saved games in this version.

## Project structure

- `game/`: exact copy of the approved development game, including the offline edition.
- `web/`: publishing metadata assets and the separate About & Controls page.
- `media/share.png`: actual screenshot used for social sharing.
- `tools/`: dependency-free Node scripts to import, prepare and check a release.
- `.github/workflows/publish.yml`: manually triggered GitHub Pages deployment.
- `PUBLISHING.md`: release and rollback procedure.
- `ITCH-LISTING.md`: listing copy and browser settings, pending owner approval.
- `DISCOVERABILITY.md`: search indexing setup and remaining account steps.

The original game uses HTML, CSS and vanilla JavaScript with an original WebGL 2
renderer. Graphics and audio are generated in code. No external game libraries,
fonts or assets are downloaded at play time. Node is used only for release preparation.

## Deliberate releases

Ordinary edits and Git commits do **not** deploy. The Pages workflow has only a
manual trigger. In the Work project, say **“Publish the current version”** when
ready, and the assistant should follow `PUBLISHING.md`, test and report the live URL.

No open-source license has been selected. Publishing this repository does not
by itself grant a license to reuse or redistribute the game.
