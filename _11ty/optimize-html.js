/**
 * Copyright (c) 2020 Google Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const isDev = require("../_data/isdevelopment");
const chokidar = require("chokidar");
const minify = require("html-minifier").minify;
const AmpOptimizer = require("@ampproject/toolbox-optimizer");
const ampOptimizer = AmpOptimizer.create({
  blurredPlaceholders: true,
  imageBasePath: "./_site/",
  //verbose: true,
});
const PurgeCSS = require("purgecss").PurgeCSS;
const csso = require("csso");
const { join } = require("path");

/**
 * Inlines the CSS.
 * Makes font display display-optional
 * Minifies and optimizes the JS
 * Optimizes HTML
 * Optimizes AMP
 */

const purifyCss = async (rawContent, outputPath) => {
  let content = rawContent;
  if (
    outputPath &&
    outputPath.endsWith(".html") &&
    !isAmp(content) &&
    !/data-style-override/.test(content)
  ) {
    let before = require("fs").readFileSync("css/main.css", {
      encoding: "utf-8",
    });

    before = before.replace(
      /@font-face {/g,
      "@font-face {font-display:optional;"
    );

    const purged = await new PurgeCSS().purge({
      content: [
        {
          raw: rawContent,
          extension: "html",
        },
      ],
      css: [
        {
          raw: before,
        },
      ],
      /*extractors: [
        {
          extractor: require("purge-from-html").extract,
          extensions: ["html"],
        },
      ],*/
      fontFace: true,
      variables: true,
    });

    const after = csso.minify(purged[0].css).css;
    //console.log("CSS reduction", before.length - after.length);

    // in watch/serve mode, reference the stylesheet. As we bypass 11ty rebuild,
    // Browsersync will reload only the css file, which is really fast
    if (isDev) {
      content = content.replace("</head>", `<link rel="stylesheet" href="/css/main.css"></head>`);
      await require('util').promisify(require('fs').writeFile)("_site/css/main.css", after, {
        encoding: "utf-8",
      });
    } else {
      content = content.replace("</head>", `<style>${after}</style></head>`);
    }
  }
  return content;
};

const minifyHtml = (rawContent, outputPath) => {
  let content = rawContent;
  if (outputPath && outputPath.endsWith(".html") && !isAmp(content)) {
    content = minify(content, {
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeComments: true,
      sortClassName: true,
      sortAttributes: true,
      html5: true,
      decodeEntities: true,
      removeOptionalTags: true,
    });
  }
  return content;
};

const optimizeAmp = async (rawContent, outputPath) => {
  let content = rawContent;
  if (outputPath && outputPath.endsWith(".html") && isAmp(content)) {
    content = await ampOptimizer.transformHtml(content);
  }
  return content;
};

const initCssWatcher = () => {
  console.log(this);
  const watcher = chokidar.watch("./css/*", {
    persistent: true
  });
  const reload = (path) => {
    var bs = require("browser-sync");
    require('fs').copyFileSync(path, join("_site", path));
    bs.reload(path);
    if(bs.has('eleventyServer'))
      bs.get('eleventyServer').reload();
    else if(bs.instances.length > 0)
      bs.instances[0].reload([join("_site", path)]);
  }
  watcher
    .on('add', reload)
    .on('change', reload);
}

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    initCssWatcher();

    eleventyConfig.addTransform("purifyCss", purifyCss);
    eleventyConfig.addTransform("minifyHtml", minifyHtml);
    eleventyConfig.addTransform("optimizeAmp", optimizeAmp);
  },
};

function isAmp(content) {
  return /\<html amp/i.test(content);
}
