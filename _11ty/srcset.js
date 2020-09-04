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

const { promisify } = require("util");
const exists = promisify(require("fs").exists);
const sharp = require("sharp");

/**
 * Generates sensible sizes for each image for use in a srcset.
 */

const widths = [1920, 1280, 640, 320];

module.exports = async function srcset(filename) {
  const names = await Promise.all(widths.map((w) => resize(filename, w)));
  return names.map((n, i) => `${n} ${widths[i]}w`).join(", ");
};

async function resize(filename, width) {
  const out = sizedName(filename, width);
  if (await exists("_site" + out)) {
    return out;
  }
  await sharp("_site" + filename)
    .resize(width)
    .jpeg()
    .toFile("_site" + out);
  return out;
}

function sizedName(filename, width, opt_extra) {
  return filename.replace(/\.\w+$/, (ext) => "-" + width + "w" + ".jpg");
}
