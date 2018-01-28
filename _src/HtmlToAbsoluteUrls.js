const posthtml = require('posthtml');
const urls = require('posthtml-urls')
const absoluteUrl = require("./AbsoluteUrl");

module.exports = function(htmlContent, base) {
  let options = {
    eachURL: function(url, attr, element) {
      url = url.trim();

    	// #anchor in-page
    	if( url.indexOf("#") === 0 ) {
    		return url;
    	}

    	return absoluteUrl(url, base);
    }
  };

  let modifier = posthtml().use(urls(options));

  return modifier.process(htmlContent);
};
