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

// Adopted from
// https://github.com/ampproject/amp-toolbox/blob/0c8755016ae825b11b63b98be83271fd14cc0486/packages/optimizer/lib/transformers/AddBlurryImagePlaceholders.js

const { promisify } = require("util");
const jimp = require("jimp");
const readFile = promisify(require("fs").readFile);
const writeFile = promisify(require("fs").writeFile);
const exists = promisify(require("fs").exists);

const PIXEL_TARGET = 60;

const ESCAPE_TABLE = {
  "#": "%23",
  "%": "%25",
  ":": "%3A",
  "<": "%3C",
  ">": "%3E",
  '"': "'",
};
const ESCAPE_REGEX = new RegExp(Object.keys(ESCAPE_TABLE).join("|"), "g");
function escaper(match) {
  return ESCAPE_TABLE[match];
}

const cache = {};

async function getCachedDataURI(src) {
  if (cache[src]) {
    return cache[src];
  }
  return (cache[src] = getDataURI(src));
}

async function getDataURI(src) {
  const image = await jimp.read(src);
  const imgDimension = getBitmapDimensions_(
    image.bitmap.width,
    image.bitmap.height
  );
  image.resize(imgDimension.width, imgDimension.height, jimp.RESIZE_BEZIER);
  const result = {
    src: await image.getBase64Async("image/png"),
    width: image.bitmap.width,
    height: image.bitmap.height,
  };
  return result;
}

function getBitmapDimensions_(imgWidth, imgHeight) {
  // Aims for a bitmap of ~P pixels (w * h = ~P).
  // Gets the ratio of the width to the height. (r = w0 / h0 = w / h)
  const ratioWH = imgWidth / imgHeight;
  // Express the width in terms of height by multiply the ratio by the
  // height. (h * r = (w / h) * h)
  // Plug this representation of the width into the original equation.
  // (h * r * h = ~P).
  // Divide the bitmap size by the ratio to get the all expressions using
  // height on one side. (h * h = ~P / r)
  let bitmapHeight = PIXEL_TARGET / ratioWH;
  // Take the square root of the height instances to find the singular value
  // for the height. (h = sqrt(~P / r))
  bitmapHeight = Math.sqrt(bitmapHeight);
  // Divide the goal total pixel amount by the height to get the width.
  // (w = ~P / h).
  const bitmapWidth = PIXEL_TARGET / bitmapHeight;
  return { width: Math.round(bitmapWidth), height: Math.round(bitmapHeight) };
}

module.exports = async function (src) {
  const filename = "_site/" + src;
  const cachedName = filename + ".blurred";
  if (await exists(cachedName)) {
    return readFile(cachedName, {
      encoding: "utf-8",
    });
  }
  // We wrap the blurred image in a SVG to avoid rasterizing the filter on each layout.
  const dataURI = await getCachedDataURI(filename);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 ${dataURI.width} ${dataURI.height}">
                  <filter id="b" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation=".5"></feGaussianBlur>
                    <feComponentTransfer>
                      <feFuncA type="discrete" tableValues="1 1"></feFuncA>
                    </feComponentTransfer>
                  </filter>
                  <image filter="url(#b)" x="0" y="0"
                    height="100%" width="100%"
                    xlink:href="${dataURI.src}">
                  </image>
                </svg>`;

  // Optimizes dataURI length by deleting line breaks, and
  // removing unnecessary spaces.
  svg = svg.replace(/\s+/g, " ");
  svg = svg.replace(/> </g, "><");
  svg = svg.replace(ESCAPE_REGEX, escaper);

  console.log(src, "[SUCCESS]");
  const URI = `data:image/svg+xml;charset=utf-8,${svg}`;
  await writeFile(cachedName, URI);
  return URI;
};
