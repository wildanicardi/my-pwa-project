if (!self.define) {
  const e = async e => {
    if ("require" !== e && (e += ".js"), !i[e] && (await new Promise(async s => {
        if ("document" in self) {
          const i = document.createElement("script");
          i.src = e, document.head.appendChild(i), i.onload = s
        } else importScripts(e), s()
      }), !i[e])) throw new Error(`Module ${e} didn’t register its module`);
    return i[e]
  }, s = async (s, i) => {
    const c = await Promise.all(s.map(e));
    i(1 === c.length ? c[0] : c)
  };
  s.toUrl = e => `./${e}`;
  const i = {
    require: Promise.resolve(s)
  };
  self.define = (s, c, r) => {
    i[s] || (i[s] = new Promise(async i => {
      let a = {};
      const d = {
          uri: location.origin + s.slice(1)
        },
        f = await Promise.all(c.map(s => "exports" === s ? a : "module" === s ? d : e(s))),
        o = r(...f);
      a.default || (a.default = o), i(a)
    }))
  }
}
define("./service-worker.js", ["./workbox-c8067db1"], (function (e) {
  "use strict";
  self.addEventListener("message", e => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting()
  }), e.precacheAndRoute([{
    url: "404.html",
    revision: "0a27a4163254fc8fce870c8cc3a3f94f"
  }, {
    url: "favicon.ico",
    revision: "2cab47d9e04d664d93c8d91aec59e812"
  }, {
    url: "index.html",
    revision: "6ba773ce92c3cc826fd03d55039115be"
  }, {
    url: "manifest.json",
    revision: "ce51d4a441b95dd1ed46d04f82ad736a"
  }, {
    url: "offline.html",
    revision: "2827dfa75b03bafd4a669195e7b052db"
  }, {
    url: "src/css/app.css",
    revision: "a6d50b281edfa6bf2424bce2ab82142a"
  }, {
    url: "src/css/feed.css",
    revision: "ce58bd6fa7141fe5c705e877e7dc86f8"
  }, {
    url: "src/css/help.css",
    revision: "1c6d81b27c9d423bece9869b07a7bd73"
  }, {
    url: "src/js/app.js",
    revision: "0ff71a8a8c35b5afcba6c1320b1f5dfe"
  }, {
    url: "src/js/feed.js",
    revision: "a956e35135d4f6cb50851b13adee6839"
  }, {
    url: "src/js/fetch.js",
    revision: "6b82fbb55ae19be4935964ae8c338e92"
  }, {
    url: "src/js/idb.js",
    revision: "2d9f7811ca3c26ae7d59569b5f6df78b"
  }, {
    url: "src/js/material.min.js",
    revision: "713af0c6ce93dbbce2f00bf0a98d0541"
  }, {
    url: "src/js/promise.js",
    revision: "10c2238dcd105eb23f703ee53067417f"
  }, {
    url: "src/js/utility.js",
    revision: "376ec08efa1d31d1645476b1c288f40d"
  }, {
    url: "sw.js",
    revision: "450cb1802f3784603d6819e00b6a732e"
  }, {
    url: "src/images/main-image-lg.jpg",
    revision: "31b19bffae4ea13ca0f2178ddb639403"
  }, {
    url: "src/images/main-image-sm.jpg",
    revision: "c6bb733c2f39c60e3c139f814d2d14bb"
  }, {
    url: "src/images/main-image.jpg",
    revision: "5c66d091b0dc200e8e89e56c589821fb"
  }, {
    url: "src/images/sf-boat.jpg",
    revision: "0f282d64b0fb306daf12050e812d6a19"
  }], {})
}));
//# sourceMappingURL=service-worker.js.map