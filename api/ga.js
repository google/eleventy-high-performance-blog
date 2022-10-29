const GA_ENDPOINT = `https://www.google-analytics.com/collect`;

// Domains to allowlist. Replace with your own!
const originallowlist = [];
// Update me.
allowlistDomain("eleventy-high-performance-blog-sample.industrialempathy.com/");

let hot = false;
let age = Date.now();

export const config = {
  runtime: "experimental-edge",
};

export default async function (req, event) {
  const url = new URL(req.url);
  if (req.method === "GET" && !url.search) {
    return new Response("OK", { status: 200 });
  }

  const origin = req.headers.get("origin") || "";
  console.log(`Received ${req.method} request from, origin: ${origin}`);

  const isOriginallowlisted =
    originallowlist.indexOf(origin) >= 0 ||
    origin.endsWith("-cramforce.vercel.app") ||
    origin.endsWith("-team-malte.vercel.app");
  if (!isOriginallowlisted) {
    console.info("Bad origin", origin);
    return new Response("Not found", { status: 404 });
  }

  let cacheControl = "no-store";
  if (url.searchParams.get("ec") == "noscript") {
    cacheControl = "max-age: 30";
  }
  const headers = {
    "Access-Control-Allow-Origin": isOriginallowlisted
      ? origin
      : originallowlist[0],
    "Cache-Control": cacheControl,
    "x-age": `${hot}; ${Date.now() - age}`,
  };
  hot = true;

  event.waitUntil(proxyToGoogleAnalytics(req, url, await req.text()));
  return new Response("D", { status: 200, headers });
}

function allowlistDomain(domain, addWww = true) {
  const prefixes = ["https://", "http://"];
  if (addWww) {
    prefixes.push("https://www.");
    prefixes.push("http://www.");
  }
  prefixes.forEach((prefix) => originallowlist.push(prefix + domain));
}

async function cid(ip, otherStuff) {
  if (ip) {
    const encoder = new TextEncoder();
    const data = encoder.encode(
      "sha256",
      ip + otherStuff + "this is open source"
    );
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }
  return Math.random() * 1000; // They use a decimal looking format. It really doesn't matter.
}

async function proxyToGoogleAnalytics(req, url, body) {
  // get GA params whether GET or POST request
  const params =
    req.method.toUpperCase() === "GET"
      ? url.searchParams
      : new URLSearchParams(body);
  const headers = req.headers;

  // attach other GA params, required for IP address since client doesn't have access to it. UA and CID can be sent from client
  params.set(
    "uip",
    headers.get("x-forwarded-for") || headers.get("x-bb-ip") || ""
  ); // ip override. Look into headers for clients IP address, as opposed to IP address of host running lambda function
  params.set("ua", params.get("ua") || headers.get("user-agent") || ""); // user agent override
  params.set(
    "cid",
    params.get("cid") || (await cid(params.get("uip", params.get("ua"))))
  );

  const qs = params.toString();
  console.info("proxying params:", qs);

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "image/gif",
    },
    body: qs,
  };
  let result;
  try {
    result = await fetch(GA_ENDPOINT, reqOptions);
  } catch (e) {
    console.error("googleanalytics error!", e);
    return;
  }
  if (result.status == 200) {
    console.debug("googleanalytics request successful");
    return;
  }
  console.error(
    "googleanalytics status code",
    result.status,
    result.statusText
  );
}

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
