const LiquidHighlight = require( "./LiquidHighlight" );

module.exports = function(liquidEngine) {
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
};