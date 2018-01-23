module.exports = function(liquidEngine) {

  return {
    parse: function(tagToken, remainTokens) {
      this.language = tagToken.args;
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

      stream.start();
    },
    render: function(scope, hash) {
      var tokens = this.tokens.map(token => {
        return token.raw.trim();
      }).join('').trim();

      return Promise.resolve(`<pre class="language-${this.language}"><code class="language-${this.language}">\n` + tokens + "\n</code></pre>");
    }
  }
};