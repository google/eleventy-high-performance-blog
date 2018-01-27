const HighlightLines = require('./HighlightLines');

class LiquidHighlight {
	constructor(liquidEngine) {
		this.liquidEngine = liquidEngine;
		this.hooks = [];
		this.classHooks = [];
	}

	addHook(hookFunction) {
		this.hooks.push(hookFunction);
	}

	addClassHook(hookFunction) {
		this.classHooks.push(hookFunction);
	}

	getObject() {
		let ret = function(highlighter) {
			return {
				parse: function(tagToken, remainTokens) {
					let split = tagToken.args.split(" ");

					this.language = split[0];
					this.highlights = new HighlightLines(split.length === 2 ? split[1] : "");
					this.highlightsAdd = new HighlightLines(split.length === 3 ? split[1] : "");
					this.highlightsRemove = new HighlightLines(split.length === 3 ? split[2] : "");

					this.tokens = [];

					var stream = highlighter.liquidEngine.parser.parseStream(remainTokens);

					stream
						.on('token', token => {
							if (token.name === 'endhighlight') {
								stream.stop();
							} else {
								this.tokens.push(token); 
							}
						})
						.on('end', x => {
							throw new Error("tag highlight not closed");
						});

					stream.start();
				},
				render: function(scope, hash) {
					let tokens = this.tokens.map(token => token.raw);
					let tokenStr = tokens.join('').trim();

					for( let hook of highlighter.hooks ) {
						tokenStr = hook.call(this, this.language, tokenStr);
					}

					let lines = tokenStr.split("\n").map(function(line, j) {
						let classHookClasses = [];
						for( let classHook of highlighter.classHooks ) {
							let ret = classHook(this.language, line, j);
							if( ret ) {
								classHookClasses.push(ret);
							}
						}

						return '<div class="highlight-line' +
							(this.highlights.isHighlighted(j) ? ' highlight-line-active' : '') +
							(this.highlightsAdd.isHighlighted(j) ? ' highlight-line-add' : '') +
							(this.highlightsRemove.isHighlighted(j) ? ' highlight-line-remove' : '') +
							(classHookClasses.length ? " " + classHookClasses.join(" ") : "") +
							'">' +
							line +
							'</div>';
					}.bind(this));

					return Promise.resolve(`<pre class="language-${this.language}"><code class="language-${this.language}">` + lines.join("") + "</code></pre>");
				}
			};
		};

		return ret(this);
	}
}

module.exports = LiquidHighlight;