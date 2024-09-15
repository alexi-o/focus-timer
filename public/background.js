let blockedUrls = [];
let timerRunning = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "updateBlockedWebsites") {
    blockedUrls = request.blockedWebsites.map((site) => {
      let normalizedSite = site.replace(/^https?:\/\//, "");
      return `*://*.${normalizedSite}/*`;
    });
    console.log("Blocked URLs:", blockedUrls);
  }
  if (request.type === "timerStatus") {
    timerRunning = request.running;
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (
      timerRunning &&
      blockedUrls.some((urlPattern) => {
        const url = new URL(details.url);
        const hostname = url.hostname;

        return blockedUrls.some((pattern) => {
          const patternHostname = pattern
            .replace("*://*.", "")
            .replace("/*", "");
          return hostname.endsWith(patternHostname);
        });
      })
    ) {
      console.log(`Blocking: ${details.url}`);
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
