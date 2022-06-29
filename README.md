# eleventy-high-performance-blog

A starter repository for building a blog with the [Eleventy static site generator](https://www.11ty.dev/) implementing a wide range of performance best practices.

![Screenshot showing that the site achieves 100 points on Lighthouse by default](https://cdn.glitch.com/db98564e-04da-47bf-a3d6-70803c3d0fe7%2FScreen%20Shot%202020-09-04%20at%2012.07.27.png?v=1599214260591)

Based on the awesome [eleventy-base-blog](https://github.com/11ty/eleventy-base-blog).

## Demo

- [Demo](https://eleventy-high-performance-blog-sample.industrialempathy.com/)
- [Original site this template was based on](https://www.industrialempathy.com/)

## Getting Started

### 1. Generate a new repository from this repository template

Click the ["Use this template"](https://github.com/google/eleventy-high-performance-blog/generate) button. Alternatively you can clone this repo yourself and push your copy to your favorite git repository.

### 2. Clone your new repository

```
git clone https://github.com/YOUR_REPO
```

### 3. Navigate to the directory

```
cd my-blog-name
```

### 4. Install dependencies

```
npm install
```

### 5. Build, serve, watch and test

```
npm run watch
```

### 6. Build and test

```
npm run build
```

## Customize

- Search for "Update me" across files in your editor to find all the site specific things you should update.
- Update the favicons in 'img/favicon/'.
- Otherwise: Knock yourself out. This is a template repository.
- For a simple color override, adjust these CSS variables at the top of `css/main.css`.

```css
:root {
  --primary: #e7bf60;
  --primary-dark: #f9c412;
}
```

## Features

### Performance outcomes

- Perfect score in applicable lighthouse audits (including accessibility).
- Single HTTP request to [First Contentful Paint](https://web.dev/first-contentful-paint/).
- Very optimized [Largest Contentful Paint](https://web.dev/lcp/) (score depends on image usage, but images are optimized).
- 0 [Cumulative Layout Shift](https://web.dev/cls/).
- ~0 [First Input Delay](https://web.dev/fid/).

### Performance optimizations

#### Images

- Generates multiple sizes of each image and uses them in **`srcset`**.
- Generates a **blurry placeholder** for each image (without adding an HTML element or using JS).
- Transcodes images to [AVIF](<https://en.wikipedia.org/wiki/AV1#AV1_Image_File_Format_(AVIF)>) and [webp](https://developers.google.com/speed/webp) and generates `picture` element.
- Transcodes GIFs to muted looping autoplaying MP4 videos for greatly reduced file size.
- **Lazy loads** images (using [native `loading=lazy`](https://web.dev/native-lazy-loading/)).
- **Async decodes** images (using `decoding=async`).
- **Lazy layout** of images and placeholders using [`content-visibility: auto`](https://web.dev/content-visibility/#skipping-rendering-work-with-content-visibility).
- **Avoids CLS impact** of images by inferring and providing width and height (Supported in Chrome, Firefox and Safari 14+).
- Downloads remote images and stores/serves them locally.
- Immutable URLs.

#### CSS

- Defaults to the compact "classless" [Bahunya CSS framework](https://kimeiga.github.io/bahunya/).
- Inlines CSS.
- Dead-code-eliminates / tree-shakes / purges (pick your favorite word) unused CSS on a per-page basis with [PurgeCSS](https://purgecss.com/).
- Minified CSS with [csso](https://www.npmjs.com/package/csso).

#### Miscellaneous

- Immutable URLs for JS.
- Sets immutable caching headers for images, fonts, and JS (CSS is inlined).
- Minifies HTML and optimizes it for compression. Uses [html-minifier](https://www.npmjs.com/package/html-minifier) with aggressive options.
- Uses [rollup](https://rollupjs.org/) to bundle JS and minifies it with [terser](https://terser.org/).
- Prefetches same-origin navigations when a navigation is likely.
- If an AMP files is present, [optimizes it](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/optimize_amp/).

#### Fonts

- Serves fonts from same origin.
- Makes fonts `display:optional`.

#### Analytics

- Supports locally serving Google Analytics's JS and proxying it's hit requests to a serverless function proxy (other proxies could be easily added).
- Supports sending [Core Web Vitals](https://web.dev/vitals/) metrics to Google Analytics as [events](https://github.com/GoogleChrome/web-vitals#send-the-results-to-google-analytics).
- Support for noscript hit requests.
- Avoids blocking onload on analytics requests.
- To turn this on, specify `googleAnalyticsId` in `metadata.json`. (Note, that this is not compatible with the not-yet-commonly used version 4 of Google Analytics.)

### DX features

- Uses 🚨 as favicon during local development.
- Supports a range of default tests.
- Runs build and tests on `git push`.
- Sourcemap generated for JS.

### SEO & Social

- Share button preferring `navigator.share()` and falling back to Twitter. Using OS-like share-icon.
- Support for OGP metadata.
- Support for Twitter metadata.
- Support for schema.org JSON-LD.
- Sitemap.xml generation.

### Largely useless glitter

- Read time estimate.
- Animated scroll progress bar…
- …with an optimized implementation that should never cause a layout.

### Security

Generates a strong [Content-Security-Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) using HTTP headers.

- Default-src is self.
- Disallows plugins.
- Generates hash based CSP for the JS used on the site.
- To extend the CSP with new rules, see [CSP.js](https://github.com/google/eleventy-high-performance-blog/blob/main/_data/csp.js#L22)

### Build performance

- Downloaded remote images, and generated sizes are cached in the local filesystem…
- …and SHOULD be committed to git.
- `.persistimages.sh` helps with this.

## Disclaimer

This is not an officially supported Google product, but rather [Malte's](https://twitter.com/cramforce) private best-effort open-source project.
