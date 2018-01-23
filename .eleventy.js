const { DateTime } = require("luxon");
const liquidjsSyntaxHighlighter = require("./_src/eleventy-liquidjs-tag-highlight-prismjs");

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

  // compatibility with existing {% highlight js %} and others
  eleventyConfig.addLiquidTag("highlight", liquidjsSyntaxHighlighter);

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

    // if your site lives in a subdirectory, change this
    pathPrefix: "/eleventy-base-blog/",

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
