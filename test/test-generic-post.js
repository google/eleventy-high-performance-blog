const assert = require("assert").strict;
const expect = require("expect.js");
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;
const existsSync = require("fs").existsSync;
const metadata = require("../_data/metadata.json");
const GA_ID = require("../_data/googleanalytics.js")();

/**
 * These tests kind of suck and they are kind of useful.
 *
 * They suck, because they need to be changed when the hardcoded post changes.
 * They are useful because I tend to break the things they test all the time.
 */

describe("check build output for a generic post", () => {
  describe("sample post", () => {
    const POST_FILENAME = "_site/posts/firstpost/index.html";
    const URL = metadata.url;
    const POST_URL = URL + "/posts/firstpost/";

    if (!existsSync(POST_FILENAME)) {
      it("WARNING skipping tests because POST_FILENAME does not exist", () => {});
      return;
    }

    let dom;
    let html;
    let doc;

    function select(selector, opt_attribute) {
      const element = doc.querySelector(selector);
      assert(element, "Expected to find: " + selector);
      if (opt_attribute) {
        return element.getAttribute(opt_attribute);
      }
      return element.textContent;
    }

    before(() => {
      html = readFileSync(POST_FILENAME);
      dom = new JSDOM(html);
      doc = dom.window.document;
    });

    it("should have metadata", () => {
      assert.equal(select("title"), "This is my first post.");
      expect(select("meta[property='og:image']", "content")).to.match(
        /\/img\/remote\/\w+.jpg/
      );
      assert.equal(select("link[rel='canonical']", "href"), POST_URL);
      assert.equal(
        select("meta[name='description']", "content"),
        "This is a post on My Blog about agile frameworks."
      );
    });

    it("should have inlined css", () => {
      const css = select("style");
      expect(css).to.match(/header nav/);
      expect(css).to.not.match(/test-dead-code-elimination-sentinel/);
    });

    it("should have script elements", () => {
      const scripts = doc.querySelectorAll("script[src]");
      let has_ga_id = GA_ID ? 1 : 0;
      expect(scripts).to.have.length(has_ga_id + 1); // NOTE: update this when adding more <script>
      expect(scripts[0].getAttribute("src")).to.match(
        /^\/js\/min\.js\?hash=\w+/
      );
    });

    it("should have GA a setup", () => {
      if (!GA_ID) {
        return;
      }
      const scripts = doc.querySelectorAll("script[src]");
      expect(scripts[1].getAttribute("src")).to.match(
        /^\/js\/cached\.js\?hash=\w+/
      );
      const noscript = doc.querySelectorAll("noscript");
      expect(noscript.length).to.be.greaterThan(0);
      let count = 0;
      for (let n of noscript) {
        if (n.textContent.includes("/api/ga")) {
          count++;
          expect(n.textContent).to.contain(GA_ID);
        }
      }
      expect(count).to.equal(1);
    });

    /*
    // Update me. Comment in if you turned on the CSP support.
    it("should have a good CSP", () => {
      const csp = select(
        "meta[http-equiv='Content-Security-Policy']",
        "content"
      );
      expect(csp).to.contain(";object-src 'none';");
      expect(csp).to.match(/^default-src 'self';/);
    });*/

    it("should have accessible buttons", () => {
      const buttons = doc.querySelectorAll("button");
      for (let b of buttons) {
        expect(
          (b.firstElementChild === null && b.textContent.trim()) ||
            b.getAttribute("aria-label") != null
        ).to.be.true;
      }
    });

    it("should have a share widget", () => {
      expect(select("share-widget button", "href")).to.equal(POST_URL);
    });

    it("should have a header", () => {
      expect(select("header > h1")).to.equal("This is my first post.");
      expect(select("header aside")).to.match(/\d+ min read./);
      expect(select("header dialog", "id")).to.equal("message");
    });

    it("should have a published date", () => {
      expect(select("article time")).to.equal("01 May 2018");
      expect(select("article time", "datetime")).to.equal("2018-05-01");
    });

    it("should link to twitter with noopener", () => {
      const twitterLinks = Array.from(doc.querySelectorAll("a")).filter((a) =>
        a.href.startsWith("https://twitter.com")
      );
      for (let a of twitterLinks) {
        expect(a.rel).to.contain("noopener");
        expect(a.target).to.equal("_blank");
      }
    });

    describe("body", () => {
      it("should have images", () => {
        const images = Array.from(
          doc.querySelectorAll("article :not(aside) picture img")
        );
        const pictures = Array.from(
          doc.querySelectorAll("article :not(aside) picture")
        );
        const metaImage = select("meta[property='og:image']", "content");
        expect(images.length).to.greaterThan(0);
        expect(pictures.length).to.greaterThan(0);
        const img = images[0];
        const picture = pictures[0];
        const sources = Array.from(picture.querySelectorAll("source"));
        expect(sources).to.have.length(3);
        expect(img.src).to.match(/^\/img\/remote\/\w+-1920w\.jpg$/);
        expect(metaImage).to.match(new RegExp(URL));
        expect(metaImage).to.match(/\/img\/remote\/\w+\.jpg$/);
        const avif = sources.shift();
        const webp = sources.shift();
        const jpg = sources.shift();
        expect(jpg.srcset).to.match(
          /\/img\/remote\/\w+-1920w.jpg 1920w, \/img\/remote\/\w+-1280w.jpg 1280w, \/img\/remote\/\w+-640w.jpg 640w, \/img\/remote\/\w+-320w.jpg 320w/
        );
        expect(webp.srcset).to.match(
          /\/img\/remote\/\w+-1920w.webp 1920w, \/img\/remote\/\w+-1280w.webp 1280w, \/img\/remote\/\w+-640w.webp 640w, \/img\/remote\/\w+-320w.webp 320w/
        );
        expect(avif.srcset).to.match(
          /\/img\/remote\/\w+-1920w.avif 1920w, \/img\/remote\/\w+-1280w.avif 1280w, \/img\/remote\/\w+-640w.avif 640w, \/img\/remote\/\w+-320w.avif 320w/
        );
        expect(jpg.type).to.equal("image/jpeg");
        expect(webp.type).to.equal("image/webp");
        //expect(avif.type).to.equal("image/avif");
        expect(jpg.sizes).to.equal("(max-width: 608px) 100vw, 608px");
        expect(webp.sizes).to.equal("(max-width: 608px) 100vw, 608px");
        expect(img.height).to.match(/^\d+$/);
        expect(img.width).to.match(/^\d+$/);
        expect(img.getAttribute("loading")).to.equal("lazy");
        expect(img.getAttribute("decoding")).to.equal("async");
        // JSDom fails to parse the style attribute properly
        expect(img.outerHTML).to.match(/svg/);
        expect(img.outerHTML).to.match(/filter/);
      });

      it("should have json-ld", () => {
        const json = select("script[type='application/ld+json']");
        const images = Array.from(
          doc.querySelectorAll("article :not(aside) img")
        );
        const obj = JSON.parse(json);
        expect(obj.url).to.equal(POST_URL);
        expect(obj.description).to.equal(
          "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster..."
        );
        expect(obj.image.length).to.be.greaterThan(0);
        obj.image.forEach((url, index) => {
          expect(url).to.equal(URL + images[index].src);
        });
      });

      it("should have paragraphs", () => {
        const images = Array.from(doc.querySelectorAll("article > p"));
        expect(images.length).to.greaterThan(0);
      });
    });
  });
});
