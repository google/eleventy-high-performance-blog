/**
 * Copyright (c) 2021 Google Inc
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
const { join } = require("path");
const shell = require("any-shell-escape");
const exists = promisify(require("fs").exists);
const exec = promisify(require("child_process").exec);
const pathToFfmpeg = require("ffmpeg-static");

exports.gif2mp4 = async function (filename) {
  const dest = mp4Name(filename);
  const exists = promisify(require("fs").exists);
  if (await exists(dest)) {
    return dest;
  }
  const command = shell([
    pathToFfmpeg,
    // See https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/
    "-y",
    "-v",
    "error",
    "-i",
    join("_site", filename),
    "-filter_complex",
    "[0:v] fps=15",
    "-vsync",
    0,
    "-f",
    "mp4",
    "-pix_fmt",
    "yuv420p",
    join("_site", dest),
  ]);
  try {
    await exec(command);
  } catch (e) {
    throw new Error(`Failed executing ${command} with ${e.stderr}`);
  }
  return dest;
};

function mp4Name(filename) {
  return filename.replace(/\.\w+$/, (_) => ".mp4");
}
