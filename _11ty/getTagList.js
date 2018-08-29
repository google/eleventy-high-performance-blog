module.exports = function(collection) {
  let tagList = {};
  collection.getAllSorted().forEach(function(item) {
    if( "tags" in item.data ) {
      let tags = item.data.tags;
      if( typeof tags === "string" ) {
        tags = [tags];
      }

      tags.filter(function(item) {
        switch(item) {
          // this list should match the `filter` list in tags.njk
          case "all":
          case "nav":
          case "post":
          case "posts":
            return false;
        }

        return true;
      }).forEach(function(tag) {
        tagList[tag] = true;
      });
    }
  });

  // returning an array in addCollection works in Eleventy 0.5.3
  return Object.keys(tagList);
};
