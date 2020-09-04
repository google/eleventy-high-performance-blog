const expect = require("expect.js");
const assert = require("assert").strict;
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;

describe("check build output", () => {
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
      html = readFileSync("_site/index.html");
      dom = new JSDOM(html);
      doc = dom.window.document;
    });

    it("should have a top navigation", () => {
      const navs = Array.from(doc.querySelectorAll("header nav a"));

      expect(navs.length).to.be.greaterThan(1);
    });

    it("should have a list of posts", () => {
      const posts = Array.from(doc.querySelectorAll("#posts ul li a"));

      expect(posts.length).to.be.greaterThan(1);
    });
  });
});
