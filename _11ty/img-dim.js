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
const path = require("path");
const { gif2mp4 } = require("./video-gif");

/**
 * Sets `width` and `height` on each image, adds blurry placeholder
 * and generates a srcset if none present.
 * Note, that the static `sizes` string would need to change for a different
 * blog layout.
 */

const processImage = async (img, outputPath) => {
  let src = img.getAttribute("src");
  if (/^(https?\:\/\/|\/\/)/i.test(src)) {
    return;
  }
  if (/^\.+\//.test(src)) {
    // resolve relative URL
    src =
      "/" +
      path.relative("./_site/", path.resolve(path.dirname(outputPath), src));
    if (path.sep == "\\") {
      src = src.replace(/\\/g, "/");
    }
  }
  let dimensions;
  try {
    dimensions = await sizeOf("_site/" + src);
  } catch (e) {
    console.warn(e.message, src);
    return;
  }
  if (!img.getAttribute("width")) {
    img.setAttribute("width", dimensions.width);
    img.setAttribute("height", dimensions.height);
  }
  if (dimensions.type == "svg") {
    return;
  }
  if (dimensions.type == "gif") {
    const videoSrc = await gif2mp4(src);
    const video = img.ownerDocument.createElement(
      /AMP/i.test(img.tagName) ? "amp-video" : "video"
    );
    [...img.attributes].map(({ name, value }) => {
      video.setAttribute(name, value);
    });
    video.src = videoSrc;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    if (!video.getAttribute("aria-label")) {
      video.setAttribute("aria-label", img.getAttribute("alt"));
      video.removeAttribute("alt");
    }
    img.parentElement.replaceChild(video, img);
    return;
  }
  if (img.tagName == "IMG") {
    img.setAttribute("decoding", "async");
    img.setAttribute("loading", "lazy");
    img.setAttribute(
      "style",
      `background-size:cover;` +
        `background-image:url("${await blurryPlaceholder(src)}")`
    );
    const doc = img.ownerDocument;
    const picture = doc.createElement("picture");
    const avif = doc.createElement("source");
    const webp = doc.createElement("source");
    const jpeg = doc.createElement("source");
    await setSrcset(avif, src, "avif");
    avif.setAttribute("type", "image/avif");
    await setSrcset(webp, src, "webp");
    webp.setAttribute("type", "image/webp");
    const fallback = await setSrcset(jpeg, src, "jpeg");
    jpeg.setAttribute("type", "image/jpeg");
    picture.appendChild(avif);
    picture.appendChild(webp);
    picture.appendChild(jpeg);
    img.parentElement.replaceChild(picture, img);
    picture.appendChild(img);
    img.setAttribute("src", fallback);
  } else if (!img.getAttribute("srcset")) {
    const fallback = await setSrcset(img, src, "jpeg");
    img.setAttribute("src", fallback);
  }
};

async function setSrcset(img, src, format) {
  const setInfo = await srcset(src, format);
  img.setAttribute("srcset", setInfo.srcset);
  img.setAttribute(
    "sizes",
    img.getAttribute("align")
      ? "(max-width: 608px) 50vw, 187px"
      : "(max-width: 608px) 100vw, 608px"
  );
  return setInfo.fallback;
}

const dimImages = async (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll("img,amp-img")];

    if (images.length > 0) {
      await Promise.all(images.map((i) => processImage(i, outputPath)));
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
