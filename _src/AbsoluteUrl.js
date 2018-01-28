const { URL } = require("url");

module.exports = function(url, base) {
	return (new URL(url, base)).toString()
};