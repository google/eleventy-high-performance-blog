const assert = require("assert").strict;
const expect = require("expect.js");
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;
const fs = require("fs");
/**
 * These tests kind of suck and they are kind of useful.
 *
 * They suck, because they need to be changed when the hardcoded post changes.
 * They are useful because I tend to break the things they test all the time.
 */
   
  describe("Draft posts", () => {
     describe("draft post page", () => {
        const DRAFT_POST = "_site/posts/sixthpostdraft/index.html";
        //const URL = metadata.url;
        
        it("should NOT be rendered", () => {
            const draftfileexists = false;
            try {
                if (fs.existsSync(DRAFT_POST)) {
                    draftfileexists = true;
                } 
              } catch(err) {
                throw err;
              }

            expect(!draftfileexists).to.be(true);
        });
     });
 });
      