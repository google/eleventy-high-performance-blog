const Prism = require('prismjs');
const LiquidHighlight = require( "./LiquidHighlight" );

module.exports = function(liquidEngine) {
	let highlight = new LiquidHighlight(liquidEngine);

	highlight.addHook(function(language, htmlStr, lines) {
		return Prism.highlight(htmlStr, Prism.languages[ language ]);
	});

	return highlight.getObject();
};