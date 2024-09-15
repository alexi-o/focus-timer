chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "showNotification") {
    chrome.notifications.create("", {
      title: "Focus Timer",
      message: message.text,
      iconUrl: "icons/icon-48.png",
      type: "basic",
    });
  }
});
