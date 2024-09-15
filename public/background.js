let timer = 0;
let interval = null;
let isWorking = true;
let running = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "startTimer") {
    if (!running) {
      startTimer(request.time);
    }
  } else if (request.type === "stopTimer") {
    stopTimer();
  } else if (request.type === "resetTimer") {
    resetTimer(request.time, request.isWorking);
  } else if (request.type === "updateBlockedWebsites") {
    updateBlockedWebsites(request.blockedWebsites);
  }
});

function startTimer(time) {
  timer = time;
  running = true;
  interval = setInterval(() => {
    if (timer > 0) {
      timer--;
      chrome.runtime.sendMessage({ type: "timerUpdate", timer });
      chrome.storage.local.set({ timer, isWorking, running });
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-48.png",
        title: "Focus Timer",
        message: "Time's up!",
      });
      stopTimer();
      toggleMode();
    }
  }, 1000);
}

function stopTimer() {
  running = false;
  clearInterval(interval);
  chrome.storage.local.set({ running });
}

function resetTimer(time, working) {
  stopTimer();
  isWorking = working;
  timer = time;
  chrome.storage.local.set({ timer, isWorking });
  chrome.runtime.sendMessage({ type: "timerUpdate", timer });
}

function toggleMode() {
  isWorking = !isWorking;
  chrome.storage.local.set({ isWorking });
}

chrome.storage.local.get(["timer", "isWorking", "running"], (result) => {
  if (result.timer !== undefined) {
    timer = result.timer;
  }
  if (result.isWorking !== undefined) {
    isWorking = result.isWorking;
  }
  if (result.running !== undefined) {
    running = result.running;
    if (running) {
      startTimer(timer);
    }
  }
});
