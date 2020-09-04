# eleventy-plugin-local-images

## What is this plugin for?
If you are pulling your Eleventy content from a cloud-based CMS or third-party API, then chances are high that any images referenced in the content will also be hosted in cloud storage. However, [Harry Roberts](https://twitter.com/@csswizardry) has suggested that it is usually more performant to self-host your static assets rather than host them on a CDN ([source](https://csswizardry.com/2019/05/self-host-your-static-assets/)).

This plugin is a post-processor that looks for image paths within your generated site, pulls down a uniquely-hashed local copy of each remote image and updates the filepaths in markup - That way you can be confident that your site's images will still be working, even if your CMS or cloud storage goes down.


## Install the plugin

From your project directory run:
```
npm install eleventy-plugin-local-images --save-dev
```
Once the package has installed, open up your `.eleventy.js` file.

__Step 1:__ Require the plugin

```js
const localImages = require('eleventy-plugin-local-images');
```

__Step 2:__ Configure and add the plugin:

```js
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(localImages, {
    distPath: '_site',
    assetPath: '/assets/img',
    selector: 'img',
    verbose: false
  });
};
```

## Configuration options

| Key | Type | Description |
|--|--|--|
| `distPath` | String | The output folder for your eleventy site, e.g. `'_site'`<br>__Required__ |
| `assetPath` | String | The root-relative folder where your image assets are stored, e.g. `'/assets/img'`<br>__Required__ |
| `selector` | String | The css selector for the images you wish to replace. This defaults to all images `'img'`, but could be used to fence certain images only, e.g. `'.post-content img'`<br>Default: `'img'` |
| `attribute` | String | The attribute containing the image path. This defaults to `'src'`, but could be used to match other attributes, e.g. `'srcset'` if targeting a `<picture><source>`, or `'data-src'` if using a lazy-loading plugin<br>Default: `'src'` |
| `verbose` | Boolean | Toggles console logging when images are saved locally<br>Default: `false` |

## Known issues

Currently, as all of the image checks are carried out asynchronously, if multiple `<img>` tags exist with the same `src` attribute, the plugin will attempt to download the file for each instance of the path. 

This isn't as efficient as it should be, however the plugin will always save the file with the same hashed filename, so it will at least not result in duplicated files on your local storage.

## Contributing

I'm really happy to consider any contributions to this plugin. Before you make any changes, please read the [contribution guide](https://github.com/robb0wen/eleventy-plugin-local-images/blob/master/CONTRIBUTING.md).
