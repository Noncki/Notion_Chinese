// ==UserScript==
// @name         Notion-zh_TW notion的汉化脚本
// @namespace    http://tampermonkey.net/
// @version      %version%
// @description  notion的100%汉化脚本，基于官方中文+机器翻译韩文，支持app版本以及网页油猴，地址：https://github.com/reamd7/notion-zh_CN
// @author       reamd7
// @match        *://www.notion.so/*
// @match        *://*.notion.site/*
// @grant        none
// @run-at       document-start
// @copyright    2021, reamd7
// @license      MIT
// ==/UserScript==
(function () {
  "use strict";
  %zh%;

  var isSafari =
    navigator.userAgent.includes("Safari/") &&
    !navigator.userAgent.includes("Chrome/");
  var isElectron = "undefined" != typeof global || window.__isElectron;

  const scriptList = document.querySelectorAll("script[defer]");
  const scriptSrcList = Array.from(scriptList).map((v) => v.src);
  if (isSafari) {
    scriptList.forEach((v) => v.remove());
    document.getElementById("notion-app").remove();
  }
  const LOCALE_SETUP = window.LOCALE_SETUP;
  var lang = LOCALE_SETUP.locale;
  const call = function () {
    Object.defineProperty(window, "LOCALE_SETUP", {
      get() {
        debugger;
        return LOCALE_SETUP;
      },
      set() {},
    });
  };
  call();

  const script = document.createElement("script");
  if (isElectron) {
    script.id = "messages";
    script.type = "text/javascript";
    script.defer = "defer";
    script.setAttribute("data-locale", lang);
    const translateText = JSON.stringify(LOCALE_SETUP.messages)
    script.text = `
      window.LOCALE_SETUP={locale: "${LOCALE_SETUP.locale}", messages: ${translateText}, routes: {}}
      const LOCALE_SETUP = window.LOCALE_SETUP;
      Object.defineProperty(window, "LOCALE_SETUP", {
        get() {
          debugger;
          return LOCALE_SETUP;
        },
        set() {},
      });
    `
  }

  function insertMoment() {
    try {
      moment.updateLocale(lang.toLowerCase(), {
        longDateFormat: {
          LT: "h:mm A",
          LTS: "h:mm:ss A",
          L: "YYYY/MM/DD",
          LL: "YYYY年M月D日",
          LLL: "YYYY年M月D日Ah点mm分",
          LLLL: "YYYY年M月D日ddddAh点mm分",
          l: "YYYY/M/D",
          ll: "YYYY年M月D日",
          lll: "YYYY年M月D日 HH:mm",
          llll: "YYYY年M月D日dddd HH:mm",
        },
      });
      moment.locale(lang.toLowerCase());
    } catch (e) {
      requestAnimationFrame(() => {
        insertMoment();
      });
    }
  }

  try {
    const preferredLocaleStr = window.localStorage.getItem(
      "LRU:KeyValueStore2:preferredLocale"
    );
    const preferredLocale = JSON.parse(preferredLocaleStr) || {"id":"KeyValueStore2:preferredLocale","value":"zh-CN","timestamp":Date.now(),"important":true};
    if (preferredLocale.value) {
      preferredLocale.value = lang;
    }
    window.localStorage.setItem(
      "LRU:KeyValueStore2:preferredLocale",
      JSON.stringify(preferredLocale)
    ); // search window.document.querySelector("#messages") 请阅读
  } catch (e) {}

  if (isElectron) {
    var observer = new MutationObserver(function (callback) {
      if (
        callback.filter((v) => {
          return v.target === document.head;
        }).length > 0
      ) {
        document.head.insertAdjacentElement("afterbegin", script);
        observer.disconnect();
      }
    });
    observer.observe(document, {
      childList: true, // 观察目标子节点的变化，是否有添加或者删除
      attributes: false, // 观察属性变动
      subtree: true, // 观察后代节点，默认为 false
    });
    insertMoment();
  } else {
    function insert() {
      try {
        document.body.appendChild(script);
      } catch (e) {
        requestAnimationFrame(() => {
          insert();
        });
      }
    }
    insert();
    insertMoment();

    // for UserScript
    if (isSafari) {
      const notionRoot = document.createElement("div");
      notionRoot.id = "notion-app";
      notionRoot.setAttribute("data-inject", true);
      document.body.append(notionRoot);
      scriptSrcList.forEach((url) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.defer = "defer";
        script.src = url;
        script.setAttribute("data-inject", true);
        document.head.append(script);
      });
      if (!window.__console || !window.__console.push) {
        window.__console = {
          push: (msg) => { },
        };
      }
    }
  }
})();
