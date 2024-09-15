<script>
  import { onMount } from "svelte";

  let defaultWorkTime = 25 * 60;
  let defaultBreakTime = 5 * 60;
  let workTime = defaultWorkTime;
  let breakTime = defaultBreakTime;
  let timer = workTime;
  let isWorking = true;
  let running = false;

  let activeTab = "timer";

  let notificationMessage = "Time's up!";
  let blockedWebpages = [];
  let newBlockedPage = "";
  let darkMode = false;

  const workTimeOptions = [1, 15, 25, 30, 45];
  const breakTimeOptions = [5, 10, 15];

  onMount(() => {
    // Load initial settings
    chrome.storage.sync.get(
      [
        "workTime",
        "breakTime",
        "notificationMessage",
        "blockedWebpages",
        "darkMode",
      ],
      (result) => {
        workTime = result.workTime || defaultWorkTime;
        breakTime = result.breakTime || defaultBreakTime;
        timer = workTime;

        notificationMessage = result.notificationMessage || "Time's up!";
        blockedWebpages = result.blockedWebpages || [];
        darkMode = result.darkMode || false;

        if (darkMode) {
          document.body.classList.add("dark-mode");
        }

        updateBlockedWebsites();
      }
    );

    chrome.storage.local.get(["timer", "isWorking", "running"], (result) => {
      timer = result.timer || workTime;
      isWorking = result.isWorking !== undefined ? result.isWorking : true;
      running = result.running || false;
    });

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "timerUpdate") {
        timer = request.timer;
      }
    });
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function startTimer() {
    if (!running) {
      running = true;
      chrome.runtime.sendMessage({ type: "startTimer", time: timer });
    }
  }

  function stopTimer() {
    running = false;
    chrome.runtime.sendMessage({ type: "stopTimer" });
  }

  function resetTimer() {
    timer = isWorking ? workTime : breakTime;
    chrome.runtime.sendMessage({ type: "resetTimer", time: timer, isWorking });
  }

  function setWorkTime(minutes) {
    workTime = minutes * 60;
    if (isWorking) {
      timer = workTime;
    }
    saveSettings();
  }

  function setBreakTime(minutes) {
    breakTime = minutes * 60;
    if (!isWorking) {
      timer = breakTime;
    }
    saveSettings();
  }

  function saveSettings() {
    chrome.storage.sync.set({
      workTime,
      breakTime,
      notificationMessage,
      blockedWebpages,
      darkMode,
    });

    updateBlockedWebsites();

    resetTimer();
  }

  function addBlockedPage() {
    if (newBlockedPage) {
      blockedWebpages = [...blockedWebpages, newBlockedPage];
      newBlockedPage = "";
      saveSettings();
    }
  }

  function removeBlockedPage(index) {
    blockedWebpages.splice(index, 1);
    saveSettings();
  }

  function updateBlockedWebsites() {
    chrome.runtime.sendMessage({
      type: "updateBlockedWebsites",
      blockedWebsites: blockedWebpages,
    });
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);
    saveSettings();
  }
</script>

<main>
  <div>
    <button on:click={() => (activeTab = "timer")}>Timer</button>
    <button on:click={() => (activeTab = "settings")}>Settings</button>
  </div>

  {#if activeTab === "timer"}
    <h1>{isWorking ? "Work Time" : "Break Time"}</h1>
    <p>{formatTime(timer)}</p>

    <div>
      <h2>Set Work Time</h2>
      {#each workTimeOptions as option}
        <button on:click={() => setWorkTime(option)}>{option} min</button>
      {/each}
    </div>

    <div>
      <h2>Set Break Time</h2>
      {#each breakTimeOptions as option}
        <button on:click={() => setBreakTime(option)}>{option} min</button>
      {/each}
    </div>

    <hr />
    <button on:click={startTimer} disabled={running}>Start</button>
    <button on:click={stopTimer} disabled={!running}>Stop</button>
    <button on:click={resetTimer}>Reset</button>
  {/if}

  {#if activeTab === "settings"}
    <h2>Settings</h2>

    <div>
      <label for="notification-message">Notification Message:</label>
      <input
        id="notification-message"
        type="text"
        bind:value={notificationMessage}
      />
    </div>

    <div>
      <h3>Blocked Webpages</h3>
      <ul>
        {#each blockedWebpages as page, index}
          <li>
            {page}
            <button on:click={() => removeBlockedPage(index)}>Remove</button>
          </li>
        {/each}
      </ul>
      <input
        type="text"
        bind:value={newBlockedPage}
        placeholder="Add a new page"
      />
      <button on:click={addBlockedPage}>Add</button>
    </div>

    <div>
      <h3>Dark Mode</h3>
      <label>
        <input
          type="checkbox"
          bind:checked={darkMode}
          on:change={toggleDarkMode}
        />
        Enable Dark Mode
      </label>
    </div>

    <button on:click={saveSettings}>Save All Settings</button>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1rem;
  }
  button {
    margin: 0.5rem;
  }
  .dark-mode {
    background-color: #333;
    color: #fff;
  }
</style>
