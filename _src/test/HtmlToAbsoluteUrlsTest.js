import test from "ava";
import htmlToAbsUrls from "../HtmlToAbsoluteUrls.js";

test("Changes a link href", async t => {
  t.is((await htmlToAbsUrls(`<a href="#testanchor">Hello</a>`, "http://example.com/")).html, `<a href="#testanchor">Hello</a>`);
  t.is((await htmlToAbsUrls(`<a href="/test.html">Hello</a>`, "http://example.com/")).html, `<a href="http://example.com/test.html">Hello</a>`);
  t.is((await htmlToAbsUrls(`<img src="/test.png">`, "http://example.com/")).html, `<img src="http://example.com/test.png">`);
  t.is((await htmlToAbsUrls(`<a href="http://someotherdomain/">Hello</a>`, "http://example.com/")).html, `<a href="http://someotherdomain/">Hello</a>`);
});
