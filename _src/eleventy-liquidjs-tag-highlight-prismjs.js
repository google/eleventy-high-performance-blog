const Prism = require('prismjs');

module.exports = function(liquidEngine) {
  let langMap = {
    "css": "css",
    "html": "markup",
    "js": "javascript"
  };

  return {
    parse: function(tagToken, remainTokens) {
      this.language = langMap[ tagToken.args ] || tagToken.args;
      this.tokens = [];

      var stream = liquidEngine.parser.parseStream(remainTokens);

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

      stream.start()
    },
    render: function(scope, hash) {
      var tokens = this.tokens.map(token => token.raw).join('').trim();
      var html = Prism.highlight(tokens, Prism.languages[ this.language ]);
      return Promise.resolve(`<pre class="language-${this.language}"><code class="language-${this.language}">` + html + "</code></pre>");
    }
  }
};