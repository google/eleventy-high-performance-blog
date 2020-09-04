const { JSDOM } = require("jsdom");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));
const blurryPlaceholder = require("./blurry-placeholder");
const srcset = require("./srcset");

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
  }
  if (!img.getAttribute("srcset")) {
    img.setAttribute("srcset", await srcset(src));
    img.setAttribute(
      "sizes",
      img.getAttribute("align")
        ? "(max-width: 608px) 50vw, 187px"
        : "(max-width: 608px) 100vw, 608px"
    );
  }
};

const dimImages = async (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath.endsWith(".html")) {
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
