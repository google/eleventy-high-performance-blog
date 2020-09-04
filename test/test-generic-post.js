const assert = require("assert").strict;
const expect = require("expect.js");
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;

describe("check build output for a generic post", () => {
  describe("sample post", () => {
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
      html = readFileSync("_site/posts/design-docs-at-google/index.html");
      dom = new JSDOM(html);
      doc = dom.window.document;
    });

    it("should have metadata", () => {
      assert.equal(select("title"), "Design Docs at Google");
      assert.equal(
        select("meta[property='og:image']", "content"),
        "https://www.industrialempathy.com/img/remote/ZCBwPv.jpg"
      );
      assert.equal(
        select("link[rel='canonical']", "href"),
        "https://www.industrialempathy.com/posts/design-docs-at-google/"
      );
      assert.equal(
        select("meta[name='description']", "content"),
        "One of the key elements of Google's software engineering culture is the use of defining software designs through design docs. These are..."
      );
    });

    it("should have inlined css", () => {
      const css = select("style");
      expect(css).to.match(/header nav/);
      expect(css).to.not.match(/test-dead-code-eimination-sentinel/);
    });

    it("should have a good CSP", () => {
      const csp = select(
        "meta[http-equiv='Content-Security-Policy']",
        "content"
      );
      expect(csp).to.contain(";object-src 'none';");
      expect(csp).to.match(/^default-src 'self';/);
    });

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
      expect(select("share-widget button", "href")).to.equal(
        "https://www.industrialempathy.com/posts/design-docs-at-google/"
      );
    });

    it("should have a header", () => {
      expect(select("header > h1")).to.equal("Design Docs at Google");
      expect(select("header aside")).to.match(/11 min read./);
      expect(select("header dialog", "id")).to.equal("message");
    });

    it("should have a published date", () => {
      expect(select("article time")).to.equal("06 Jul 2020");
      expect(select("article time", "datetime")).to.equal("2020-07-06");
    });

    it("should link to twitter with noopener", () => {
      const twitterLinks = Array.from(doc.querySelectorAll("a")).filter((a) =>
        a.href.startsWith("https://twitter.com")
      );
      expect(twitterLinks.length).to.be.greaterThan(1);
      for (let a of twitterLinks) {
        expect(a.rel).to.contain("noopener");
        expect(a.target).to.equal("_blank");
      }
    });

    describe("body", () => {
      it("should have images", () => {
        const images = Array.from(
          doc.querySelectorAll("article :not(aside) img")
        );
        const metaImage = select("meta[property='og:image']", "content");
        expect(images.length).to.equal(2);
        const img = images[0];
        expect(img.src).to.equal("/img/remote/ZCBwPv.jpg");
        expect(metaImage).to.equal(
          "https://www.industrialempathy.com" + img.src
        );
        expect(img.srcset).to.equal(
          "/img/remote/ZCBwPv-1920w.jpg 1920w, /img/remote/ZCBwPv-1280w.jpg 1280w, /img/remote/ZCBwPv-640w.jpg 640w, /img/remote/ZCBwPv-320w.jpg 320w"
        );
        expect(img.sizes).to.equal("(max-width: 608px) 100vw, 608px");
        expect(img.height).to.equal(488);
        expect(img.width).to.equal(600);
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
        expect(obj.url).to.equal(
          "https://www.industrialempathy.com/posts/design-docs-at-google/"
        );
        expect(obj.description).to.equal(
          "One of the key elements of Google&#39;s software engineering culture is the use of defining software designs through design docs. These are..."
        );
        expect(obj.image.length).to.equal(2);
        obj.image.forEach((url, index) => {
          expect(url).to.equal(
            "https://www.industrialempathy.com" + images[index].src
          );
        });
      });

      it("should have paragraphs", () => {
        const images = Array.from(
          doc.querySelectorAll("article :not(aside) p")
        );
        expect(images.length).to.equal(11);
      });
    });
  });
});
