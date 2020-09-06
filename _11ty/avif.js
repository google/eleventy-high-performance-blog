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
const readFile = promisify(require("fs").readFile);
const writeFile = promisify(require("fs").writeFile);
const sharp = require("sharp");
const wasm_avif = require("@saschazar/wasm-avif");
const defaultOptions = require("@saschazar/wasm-avif/options");

module.exports = async function (inputFilename, outputFilename, targetWidth) {
  defaultOptions.minQuantizer = 33;
  defaultOptions.maxQuantizer = 63;
  defaultOptions.minQuantizerAlpha = 33;
  defaultOptions.maxQuantizerAlpha = 63;

  const inputInfo = await sharp(inputFilename)
    .resize(targetWidth)
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });
  const input = inputInfo.data;
  const info = inputInfo.info;

  console.log(
    "Encoding avif image. If this is slow, consid caching images in git with ./persistimages.sh"
  );

  // Initialize the WebAssembly Module
  const result = await new Promise((resolve) => {
    wasm_avif({
      onRuntimeInitialized() {
        const chroma = 3; // chroma subsampling: 1 for 4:4:4, 2 for 4:2:2, 3 for 4:2:0
        const r = this.encode(
          input,
          info.width,
          info.height,
          info.channels,
          defaultOptions,
          chroma
        ); // encode image data and return a new Uint8Array
        this.free(); // clean up memory after encoding is done
        resolve(r);
      },
    });
  });

  return writeFile(outputFilename, result);
};
