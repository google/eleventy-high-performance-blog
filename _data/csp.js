/**
 * Provides the default CSP.
 * Inline scripts must have the `csp-hash` attribute to be allowed.
 */

function quote(str) {
  return `'${str}'`;
}

function serialize(csp) {
  return csp.map((src) => src.join(" ")).join(";");
}

const SELF = quote("self");

const CSP = {
  regular: serialize([
    // By default only talk to same-origin
    ["default-src", SELF],
    // No plugins
    ["object-src", quote("none")],
    // Script from same-origin and inline-hashes.
    ["script-src", SELF, /* Replaced by csp.js plugin */ "HASHES"],
    // Inline CSS is allowed.
    ["style-src", quote("unsafe-inline")],
    // Images may also come from data-URIs.
    ["img-src", SELF, "data:"],
  ]),
};

module.exports = () => CSP;
