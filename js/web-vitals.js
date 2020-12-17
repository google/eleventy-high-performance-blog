// Copy of https://unpkg.com/web-vitals@1.0.1/dist/web-vitals.umd.js
// Copyright Google LLC.
// SPDX-License-Identifier: Apache-2.0
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).webVitals={})}(this,(function(e){"use strict";var t,n,i,a,r=function(e,t){return{name:e,value:void 0===t?-1:0,delta:0,entries:[],id:"v1-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12)}},o=function(e,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var n=new PerformanceObserver((function(e){return e.getEntries().map(t)}));return n.observe({type:e,buffered:!0}),n}}catch(e){}},u=!1,c=function(e,t){u||"undefined"!=typeof InstallTrigger||(addEventListener("beforeunload",(function(){})),u=!0);addEventListener("visibilitychange",(function n(i){"hidden"===document.visibilityState&&(e(i),t&&removeEventListener("visibilitychange",n,!0))}),!0)},s=function(e){addEventListener("pageshow",(function(t){t.persisted&&e(t)}),!0)},f=new WeakSet,d=function(e,t,n){var i;return function(){t.value>=0&&(n||f.has(t)||"hidden"===document.visibilityState)&&(t.delta=t.value-(i||0),(t.delta||void 0===i)&&(i=t.value,e(t)))}},m=-1,p=function(){return"hidden"===document.visibilityState?0:1/0},v=function(){c((function(e){var t=e.timeStamp;m=t}),!0)},l=function(){return m<0&&(m=p(),v(),s((function(){setTimeout((function(){m=p(),v()}),0)}))),{get timeStamp(){return m}}},y={passive:!0,capture:!0},g=new Date,h=function(e,a){t||(t=a,n=e,i=new Date,b(removeEventListener),S())},S=function(){if(n>=0&&n<i-g){var e={entryType:"first-input",name:t.type,target:t.target,cancelable:t.cancelable,startTime:t.timeStamp,processingStart:t.timeStamp+n};a.map((function(t){t(e)})),a=[]}},T=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){h(e,t),a()},i=function(){a()},a=function(){removeEventListener("pointerup",n,y),removeEventListener("pointercancel",i,y)};addEventListener("pointerup",n,y),addEventListener("pointercancel",i,y)}(t,e):h(t,e)}},b=function(e){["mousedown","keydown","touchstart","pointerdown"].map((function(t){return e(t,T,y)}))};e.getCLS=function(e,t){var n,i=r("CLS",0),a=function(e){e.hadRecentInput||(i.value+=e.value,i.entries.push(e),n())},u=o("layout-shift",a);u&&(n=d(e,i,t),c((function(){u.takeRecords().map(a),n()})),s((function(){i=r("CLS",0),n=d(e,i,t)})))},e.getFCP=function(e,t){var n,i=l(),a=r("FCP"),u=o("paint",(function(e){"first-contentful-paint"===e.name&&(u&&u.disconnect(),e.startTime<i.timeStamp&&(a.value=e.startTime,a.entries.push(e),f.add(a),n()))}));u&&(n=d(e,a,t),s((function(i){a=r("FCP"),n=d(e,a,t),requestAnimationFrame((function(){requestAnimationFrame((function(){a.value=performance.now()-i.timeStamp,f.add(a),n()}))}))})))},e.getFID=function(e,i){var u,m=l(),p=r("FID"),v=function(e){e.startTime<m.timeStamp&&(p.value=e.processingStart-e.startTime,p.entries.push(e),f.add(p),u())},y=o("first-input",v);u=d(e,p,i),y&&c((function(){y.takeRecords().map(v),y.disconnect()}),!0),y&&s((function(){var o;p=r("FID"),u=d(e,p,i),a=[],n=-1,t=null,b(addEventListener),o=v,a.push(o),S()}))},e.getLCP=function(e,t){var n,i=l(),a=r("LCP"),u=function(e){var t=e.startTime;t<i.timeStamp&&(a.value=t,a.entries.push(e)),n()},m=o("largest-contentful-paint",u);if(m){n=d(e,a,t);var p=function(){f.has(a)||(m.takeRecords().map(u),m.disconnect(),f.add(a),n())};["keydown","click"].map((function(e){addEventListener(e,p,{once:!0,capture:!0})})),c(p,!0),s((function(i){a=r("LCP"),n=d(e,a,t),requestAnimationFrame((function(){requestAnimationFrame((function(){a.value=performance.now()-i.timeStamp,f.add(a),n()}))}))}))}},e.getTTFB=function(e){var t,n=r("TTFB");t=function(){try{var t=performance.getEntriesByType("navigation")[0]||function(){var e=performance.timing,t={entryType:"navigation",startTime:0};for(var n in e)"navigationStart"!==n&&"toJSON"!==n&&(t[n]=Math.max(e[n]-e.navigationStart,0));return t}();n.value=n.delta=t.responseStart,n.entries=[t],e(n)}catch(e){}},"complete"===document.readyState?setTimeout(t,0):addEventListener("pageshow",t)},Object.defineProperty(e,"__esModule",{value:!0})}));

  // Function taken from https://github.com/GoogleChrome/web-vitals#using-analyticsjs
  // To see report data in GA: Behavior > Events > Top Events > Select "Web Vitals" category
  // CLS, LCP, and FID should appear (may take 24 hours or longer)
  sendToGoogleAnalytics = ({name, delta, id}) => {
    // Assumes the global `ga()` function exists, see:
    // https://developers.google.com/analytics/devguides/collection/analyticsjs
    ga('send', 'event', {
      eventCategory: 'Web Vitals',
      eventAction: name,
      // Google Analytics metrics must be integers, so the value is rounded.
      // For CLS the value is first multiplied by 1000 for greater precision
      // (note: increase the multiplier for greater precision if needed).
      eventValue: Math.round(name === 'CLS' ? delta * 1000 : delta),
      // The `id` value will be unique to the current page load. When sending
      // multiple values from the same page (e.g. for CLS), Google Analytics can
      // compute a total by grouping on this ID (note: requires `eventLabel` to
      // be a dimension in your report).
      eventLabel: id,
      // Use a non-interaction event to avoid affecting bounce rate.
      nonInteraction: true,
      // Use `sendBeacon()` if the browser supports it.
      transport: 'beacon',
    });
  }
