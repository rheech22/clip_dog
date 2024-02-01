async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const tab = await getCurrentTab();

const port = chrome.runtime.connect({ name: "Netracer" });

port.onMessage.addListener((msg) => {
  console.log(msg);
  chrome.storage.local.get(["key"]).then((result) => {
    const jsonString = JSON.stringify(result.key);

    const blob = new Blob([jsonString], { type: "application/json" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);

    downloadLink.download = "myObject.json";
    downloadLink.innerHTML = "download";

    document.body.appendChild(downloadLink);
  });
});

const startButton = document.getElementById("start");
const endButton = document.getElementById("end");

startButton.addEventListener("click", () => {
  port.postMessage({ tab, method: "START" });
});

endButton.addEventListener("click", () => {
  port.postMessage({ tab, method: "END" });
});
