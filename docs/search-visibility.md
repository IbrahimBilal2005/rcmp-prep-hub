# Search visibility

The public homepage is the only URL currently included in `public/sitemap.xml`. Dashboard, admin, signup, training, and unknown routes receive `noindex, follow` metadata when the app renders. They are not blocked in robots.txt, so crawlers can see that instruction. This is indexing guidance, not access control.

The canonical domain is explicitly `https://www.aptitudeforge.ca/` in the HTML, route metadata, sitemap, and robots.txt. Keep those values consistent if the domain changes. Homepage tracking parameters resolve to the clean canonical URL.

The homepage title and description are in `index.html`; `SeoMetadata.tsx` restores them during client-side navigation. Keep the two copies aligned. Organization and WebSite JSON-LD describe the existing business and site without inventing ratings or endorsements. The visible FAQ links to the official RCMP preparation guide.

The homepage renders independently of authentication readiness. It still uses client-side React rendering; full HTML prerendering is a future improvement for crawlers that do not execute JavaScript.

After deployment:

1. Verify ownership of the canonical domain in Google Search Console.
2. Submit `https://www.aptitudeforge.ca/sitemap.xml`.
3. Inspect the homepage with URL Inspection and check the rendered page before requesting indexing.
4. Check impressions and actual search queries before deciding which public study guides to add. The phrases used here are relevant product descriptions, not claims of measured keyword volume.

Google controls indexing and rankings; metadata and a sitemap do not guarantee placement. Further content should answer useful preparation questions and be linked from public pages.

References: [Google's developer SEO guide](https://developers.google.com/search/docs/fundamentals/get-started-developers), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [official RCMP preparation guide](https://www.rcmp.ca/en/careers-rcmp/police-officer-careers/application-process/rcmp-online-assessment-preparatory-guide).
