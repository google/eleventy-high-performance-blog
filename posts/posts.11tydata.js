const todaysDate = new Date();
const isDev = require("../_data/isdevelopment")();

function showDraft(data) {
    if(isDev) return true;
    const isDraft = 'draft' in data && data.draft !== false;
    const isFutureDate = data.page.date > todaysDate;
    return !isDraft && !isFutureDate;
}

module.exports = ()=> {
    return {
        eleventyComputed: {
            eleventyExcludeFromCollections: data => showDraft(data) ? data.eleventyExcludeFromCollections : true,
            permalink: data => showDraft(data) ? data.permalink : false,
            "tags": [
                "posts"
              ],
        }
    }
}