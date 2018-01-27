const Prism = require('prismjs');
const LiquidHighlight = require( "./LiquidHighlight" );

module.exports = {
	plain: function(liquidEngine) {
		let highlight = new LiquidHighlight(liquidEngine);

		highlight.addClassHook(function(language, line) {
			if( language === "dir" ) {
				// has trailing slash
				if( line.match(/\/$/) !== null ) {
					return "highlight-line-isdir";
				}
			}
		});

		return highlight.getObject();
	},
	prismjs: function(liquidEngine) {
		let highlight = new LiquidHighlight(liquidEngine);

		highlight.addHook(function(language, htmlStr, lines) {
			return Prism.highlight(htmlStr, Prism.languages[ language ]);
		});

		return highlight.getObject();
	}
};