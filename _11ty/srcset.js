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
