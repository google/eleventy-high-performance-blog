const todaysDate = new Date();
const isDev = require("../_data/isdevelopment")();

function showDraft(data) {
  if (isDev) return true;
  const isDraft = "draft" in data && data.draft !== false;
  const isPostInFuture =
    "scheduled" in data ? data.scheduled > todaysDate : false;
  return !isDraft && !isPostInFuture;
}

module.exports = () => {
  return {
    eleventyComputed: {
      eleventyExcludeFromCollections: (data) =>
        showDraft(data) ? data.eleventyExcludeFromCollections : true,
      permalink: (data) => (showDraft(data) ? data.permalink : false),
      tags: ["posts"],
    },
  };
};
