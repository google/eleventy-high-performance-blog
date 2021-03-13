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
