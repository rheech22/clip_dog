async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const tab = await getCurrentTab();

const port = chrome.runtime.connect({ name: "Netracer" });

port.onMessage.addListener((msg) => {
  console.log(msg);
});

const startButton = document.getElementById("start");
const endButton = document.getElementById("end");

startButton.addEventListener("click", () => {
  port.postMessage({ tab, method: "START" });
});

endButton.addEventListener("click", () => {
  port.postMessage({ tab, method: "END" });
});
