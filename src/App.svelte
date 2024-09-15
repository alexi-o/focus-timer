<script>
  import { onMount } from "svelte";

  let workTime = 25 * 60; // 25 minutes
  let breakTime = 5 * 60; // 5 minutes
  let timer = workTime;
  let interval;
  let isWorking = true;
  let running = false;

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
</script>

<main>
  <h1>{isWorking ? "Work Time" : "Break Time"}</h1>
  <p>{formatTime(timer)}</p>
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
