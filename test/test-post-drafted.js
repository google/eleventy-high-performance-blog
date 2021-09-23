const assert = require("assert").strict;
const expect = require("expect.js");
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;
const fs = require("fs");
const existsSync = require("fs").existsSync;
/**
 * These tests kind of suck and they are kind of useful.
 *
 * They suck, because they need to be changed when the hardcoded post changes.
 * They are useful because I tend to break the things they test all the time.
 */
   
  describe("Draft posts", () => {
     describe("draft post", () => {
        const DRAFT_POST = "_site/posts/sixthpostdraft/index.html";
        
        it("w. draft: true should NOT be rendered", () => {
            var draftfileexists = false;
            try {
                if (existsSync(DRAFT_POST)) {
                    draftfileexists = true;
                } 
              } catch(err) {
                throw err;
              }

            expect(!draftfileexists).to.be(true);
        });
     });
     describe("draft post from future", () => {
      const DRAFT_POST_FUTURE = "_site/posts/seventhpost/index.html";
      
      it("should NOT be rendered", () => {
          var draftpostfutureexists = false;
          try {
              if (existsSync(DRAFT_POST_FUTURE)) {
                draftpostfutureexists = true;
              } 
            } catch(err) {
              throw err;
            }

          expect(!draftpostfutureexists).to.be(true);
      });
   });
 });
      