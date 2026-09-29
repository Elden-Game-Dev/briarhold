# Search and social sharing

Prepared: descriptive title and meta description; canonical URL and social image
URLs generated from the actual Pages URL; Open Graph and Twitter card metadata;
original SVG favicon; VideoGame structured data; crawlable title/intro; a separate
About & Controls page; sitemap containing the game and About page. No keyword
stuffing, invented ratings, analytics or third-party tracking scripts.

The current share image is a real 1280×720 screenshot of the game's title scene.
No Google indexing submission has been made yet; the public site must exist first.

## Once the real URL is live

1. Verify 200 responses for the game, About page, sitemap, preview and favicon.
   Confirm canonical and social URLs use the actual HTTPS Pages address.
2. Ask the owner to sign in to Google Search Console. Add a **URL-prefix** property
   with the exact final project URL, including its `/briarhold/` path.
3. Choose HTML file verification or HTML tag verification. Add the supplied file
   to the build output via a tracked source file, or the supplied verification
   meta tag to the build's head. Keep verification in future releases. Publish
   this owner-authorized setup change, then complete verification in Search Console.
4. Submit the live `sitemap.xml`. Inspect the main game URL and request indexing.
   Check later for crawl/indexing errors. Inclusion and rankings are not guaranteed.
5. Add a link from the approved itch.io listing to the main website when ready.

For a project site such as `https://OWNER.github.io/briarhold/`, a robots file under
`/briarhold/` does not control the origin. The build therefore does not create a
misleading project-level robots file. No robots file is needed to permit crawling.
If the owner already controls `https://OWNER.github.io/robots.txt`, inspect it for
conflicting rules; do not modify an unrelated root website without permission.
For an origin-root site, the build emits a permissive robots.txt with sitemap URL.

Official references:
- https://support.google.com/webmasters/answer/9008080
- https://support.google.com/webmasters/answer/34592
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
