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
const cspHashGen = require("csp-hash-generator");

/**
 * Substitute the magic `HASHES` string in the CSP with the actual values of the
 * loaded JS files.
 * The ACTUAL CSP is configured in `_data/csp.js`.
 */

// Allow the auto-reload script in local dev. Would be good to get rid of this magic
// string which would break on ungrades of 11ty.
const AUTO_RELOAD_SCRIPT = quote(
  "sha256-ThhI8UaSFEbbl6cISiZpnJ4Z44uNSq2tPKgyRTD3LyU="
);

function quote(str) {
  return `'${str}'`;
}

const addCspHash = async (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const cspAble = [
      ...dom.window.document.querySelectorAll("script[csp-hash]"),
    ];

    const hashes = cspAble.map((element) => {
      const hash = cspHashGen(element.textContent);
      element.setAttribute("csp-hash", hash);
      return quote(hash);
    });
    if (isDevelopmentMode()) {
      hashes.push(AUTO_RELOAD_SCRIPT);
    }

    const csp = dom.window.document.querySelector(
      "meta[http-equiv='Content-Security-Policy']"
    );
    if (!csp) {
      return content;
    }
    csp.setAttribute(
      "content",
      csp.getAttribute("content").replace("HASHES", hashes.join(" "))
    );

    content = dom.serialize();
  }

  return content;
};

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform("csp", addCspHash);
  },
};

function isDevelopmentMode() {
  return /serve/.test(process.argv.join());
}
