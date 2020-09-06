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

const { JSDOM } = require("jsdom");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));
const blurryPlaceholder = require("./blurry-placeholder");
const srcset = require("./srcset");

const ACTIVATE_AVIF = false;

/**
 * Sets `width` and `height` on each image, adds blurry placeholder
 * and generates a srcset if none present.
 * Note, that the static `sizes` string would need to change for a different
 * blog layout.
 */

const processImage = async (img) => {
  const src = img.getAttribute("src");
  if (!img.getAttribute("width")) {
    if (/^(https?\:|\/\/)/i.test(src)) {
      return;
    }
    const dimensions = await sizeOf("_site/" + src);
    img.setAttribute("width", dimensions.width);
    img.setAttribute("height", dimensions.height);
  }
  if (img.tagName == "IMG") {
    img.setAttribute("decoding", "async");
    img.setAttribute("loading", "lazy");
    img.setAttribute(
      "style",
      `background-size:cover;background-image:url("${await blurryPlaceholder(
        src
      )}")`
    );
    const doc = img.ownerDocument;
    const picture = doc.createElement("picture");
    const avif = doc.createElement("source");
    const webp = doc.createElement("source");
    const jpeg = doc.createElement("source");
    if (ACTIVATE_AVIF) {
      await setSrcset(avif, src, "avif");
    }
    avif.setAttribute("type", "image/avif");
    await setSrcset(webp, src, "webp");
    webp.setAttribute("type", "image/webp");
    await setSrcset(jpeg, src, "jpeg");
    jpeg.setAttribute("type", "image/jpeg");
    if (ACTIVATE_AVIF) {
      picture.appendChild(avif);
    }
    picture.appendChild(webp);
    picture.appendChild(jpeg);
    img.parentElement.replaceChild(picture, img);
    picture.appendChild(img);
  } else if (!img.getAttribute("srcset")) {
    await setSrcset(img, src, "jpeg");
  }
};

async function setSrcset(img, src, format) {
  img.setAttribute("srcset", await srcset(src, format));
  img.setAttribute(
    "sizes",
    img.getAttribute("align")
      ? "(max-width: 608px) 50vw, 187px"
      : "(max-width: 608px) 100vw, 608px"
  );
}

const dimImages = async (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll("img,amp-img")];

    if (images.length > 0) {
      await Promise.all(images.map((i) => processImage(i)));
      content = dom.serialize();
    }
  }

  return content;
};

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform("imgDim", dimImages);
  },
};
