const { DateTime } = require("luxon");
const metadata = require("./_data/metadata.json");
const absoluteUrl = require("./_src/absoluteUrl");
const HtmlToAbsoluteUrls = require("./_src/HtmlToAbsoluteUrls");
const syntaxHighlighter = require("./_src/eleventy-liquidjs-tag-highlight-prismjs");

function dateToISO(dateObj) {
  return DateTime.fromJSDate(dateObj).toISO({ includeOffset: true, suppressMilliseconds: true });
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("rssLastUpdatedDate", collection => {
    if( !collection.length ) {
      throw new Error( "Collection is empty in lastUpdatedDate filter." );
    }
    // Newest date in the collection
    return dateToISO(collection[ collection.length - 1 ].date);
  });

  eleventyConfig.addFilter("rssDate", dateObj => {
    return dateToISO(dateObj);
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  eleventyConfig.addNunjucksFilter("absoluteUrl", function(href, base) {
    return absoluteUrl(href, base);
  });

  eleventyConfig.addNunjucksFilter("htmlToAbsoluteUrls", function(htmlContent, base, callback) {
    if(!htmlContent) {
      callback(null, "");
      return;
    }

    HtmlToAbsoluteUrls(htmlContent, base).then(result => {
      callback(null, result.html);
    });
  }, true);

  // compatibility with existing {% highlight js %} and others
  eleventyConfig.addLiquidTag("highlight", syntaxHighlighter);

  // only content in the `posts/` directory
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getAllSorted().filter(function(item) {
      return item.inputPath.match(/^\.\/posts\//) !== null;
    });
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "png",
      "jpg",
      "css"
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
