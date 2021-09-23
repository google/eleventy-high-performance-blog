const todaysDate = new Date();

function showDraft(data) {
    const isDraft = 'draft' in data && data.draft !== false;
    const isFutureDate = data.page.date > todaysDate;
    return (!isDraft && !isFutureDate);
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