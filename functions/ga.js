const request = require("phin");
const querystring = require("querystring");

const GA_ENDPOINT = `https://www.google-analytics.com/collect`;

// Domains to allowlist. Replace with your own!
const originallowlist = []; // keep this empty and append domains to allowlist using allowlistDomain()
// Update me.
allowlistDomain("eleventy-high-performance-blog-sample.industrialempathy.com/");

function allowlistDomain(domain, addWww = true) {
  const prefixes = ["https://", "http://"];
  if (addWww) {
    prefixes.push("https://www.");
    prefixes.push("http://www.");
  }
  prefixes.forEach((prefix) => originallowlist.push(prefix + domain));
}

function cid(ip, otherStuff) {
  if (ip) {
    return require("crypto")
      .createHmac("sha256", ip + otherStuff + new Date().toLocaleDateString())
      .update("this is open source")
      .digest("hex");
  }
  return Math.random() * 1000; // They use a decimal looking format. It really doesn't matter.
}

function proxyToGoogleAnalytics(event) {
  // get GA params whether GET or POST request
  const params =
    event.httpMethod.toUpperCase() === "GET"
      ? event.queryStringParameters
      : querystring.parse(event.body);
  const headers = event.headers || {};

  // attach other GA params, required for IP address since client doesn't have access to it. UA and CID can be sent from client
  params.uip = headers["x-forwarded-for"] || headers["x-bb-ip"] || ""; // ip override. Look into headers for clients IP address, as opposed to IP address of host running lambda function
  params.ua = params.ua || headers["user-agent"] || ""; // user agent override
  params.cid = params.cid || cid(params.uip, params.ua);

  const qs = querystring.stringify(params);
  console.info("proxying params:", Object.keys(params).join(", "));

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "image/gif",
    },
    url: GA_ENDPOINT,
    data: qs,
  };

  request(reqOptions, (error, result) => {
    if (error) {
      console.info("googleanalytics error!", error);
    } else {
      if (result.statusCode == 200) {
        return;
      }
      console.info(
        "googleanalytics status code",
        result.statusCode,
        result.statusMessage
      );
    }
  });
}

exports.handler = function (event, context, callback) {
  const origin = event.headers["origin"] || event.headers["Origin"] || "";
  console.log(`Received ${event.httpMethod} request from, origin: ${origin}`);

  const isOriginallowlisted = originallowlist.indexOf(origin) >= 0;
  if (!isOriginallowlisted) {
    console.info("Bad origin", origin);
  }

  let cacheControl = "no-store";
  if (event.queryStringParameters["ec"] == "noscript") {
    cacheControl = "max-age: 30";
  }

  const headers = {
    //'Access-Control-Allow-Origin': '*', // allow all domains to POST. Use for localhost development only
    "Access-Control-Allow-Origin": isOriginallowlisted
      ? origin
      : originallowlist[0],
    "Cache-Control": cacheControl,
  };

  const done = () => {
    callback(null, {
      statusCode: 204,
      headers,
      body: "",
    });
  };

  if (event.httpMethod === "OPTIONS") {
    // CORS (required if you use a different subdomain to host this function, or a different domain entirely)
    done();
  } else if (isOriginallowlisted) {
    // allow GET or POST, but only for allowlisted domains
    done(); // Fire and forget
    proxyToGoogleAnalytics(event);
  } else {
    callback("Not found");
  }
};

/*
 Docs on GA endpoint and example params

 https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide

v: 1
_v: j67
a: 751874410
t: pageview
_s: 1
dl: https://nfeld.com/contact.html
dr: https://google.com
ul: en-us
de: UTF-8
dt: Nikolay Feldman - Software Engineer
sd: 24-bit
sr: 1440x900
vp: 945x777
je: 0
_u: blabla~
jid: 
gjid: 
cid: 1837873423.1522911810
tid: UA-116530991-1
_gid: 1828045325.1524815793
gtm: u4d
z: 1379041260
*/
