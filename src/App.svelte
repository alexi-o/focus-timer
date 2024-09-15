<script>
  import { onMount } from "svelte";

  let defaultWorkTime = 25 * 60;
  let defaultBreakTime = 5 * 60;
  let workTime = defaultWorkTime;
  let breakTime = defaultBreakTime;
  let timer = workTime;
  let interval = null;
  let isWorking = true;
  let running = false;

  const workTimeOptions = [15, 25, 30, 45];
  const breakTimeOptions = [5, 10, 15];

  onMount(() => {
    chrome.storage.sync.get(["workTime", "breakTime"], (result) => {
      workTime = result.workTime || defaultWorkTime;
      breakTime = result.breakTime || defaultBreakTime;
      timer = workTime;
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
      interval = setInterval(() => {
        if (timer > 0) {
          timer--;
        } else {
          notify();
          toggleMode();
        }
      }, 1000);
    }
  }

  function stopTimer() {
    running = false;
    clearInterval(interval);
  }

  function resetTimer() {
    stopTimer();
    timer = isWorking ? workTime : breakTime;
  }

  function toggleMode() {
    isWorking = !isWorking;
    timer = isWorking ? workTime : breakTime;
    startTimer();
  }

  function notify() {
    chrome.runtime.sendMessage({
      type: "showNotification",
      text: isWorking ? "Time for a break!" : "Back to work!",
    });
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
    chrome.storage.sync.set({ workTime, breakTime });
    resetTimer();
  }
</script>

<main>
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

  <button on:click={startTimer} disabled={running}>Start</button>
  <button on:click={stopTimer} disabled={!running}>Stop</button>
  <button on:click={resetTimer}>Reset</button>
</main>

<style>
  main {
    text-align: center;
    padding: 1rem;
  }
  button {
    margin: 0.5rem;
  }
</style>
