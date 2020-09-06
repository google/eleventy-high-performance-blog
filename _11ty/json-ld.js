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
const BASE_URL = require("../_data/metadata.json").url;

/**
 * Validate json-ld being valid JSON and add the document images to the JSON.
 */

const jsonLd = (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const jsonLd = dom.window.document.querySelector(
      "script[type='application/ld+json']"
    );
    if (!jsonLd) {
      return content;
    }

    const images = [
      ...dom.window.document.querySelectorAll("main img,amp-img"),
    ];
    try {
      const obj = JSON.parse(jsonLd.textContent);

      if (images.length) {
        obj.image = images.map((img) => BASE_URL + img.src);
        jsonLd.textContent = JSON.stringify(obj);
        content = dom.serialize();
      }
    } catch (e) {
      throw new Error(`Failed to parse json-ld: ${e.message}`);
    }
  }

  return content;
};

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform("jsonLd", jsonLd);
  },
};
