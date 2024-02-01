const attachDebugger = (tabId) => {
  chrome.debugger.attach({ tabId }, "1.3", () => {
    chrome.debugger.sendCommand(
      { tabId },
      "Network.enable",
      {},
      () => chrome.runtime.lastError && console.error(chrome.runtime.lastError),
    );
  });
  console.log("Debugger attached");
};

const detachDebugger = (tabId) => {
  chrome.debugger.detach({ tabId });
  console.log("Debugger detached");
};

const methods = ["START", "END"];

const getDomainName = (url) => {
  return url.replace(/https?:\/\/([^\s\/:]+)(\S*$)/i, "$1");
};

let log = {};

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    const { tab, method } = msg;

    if (!tab) {
      console.log("Tab Not Found");
      return;
    }

    if (!methods.includes(method)) {
      console.log("Invalid Method");
      return;
    }

    if (method === "END") {
      detachDebugger(tab.id);
      return;
    }

    if (tab.url.startsWith("http")) {
      attachDebugger(tab.id);
    } else {
      console.log("Debugger can only be attached to HTTP/HTTPS pages.");
    }
  });

  chrome.debugger.onEvent.addListener(async (source, method, params) => {
    if (method === "Network.requestWillBeSent") {
      const { request, requestId } = params;

      log[requestId] = { request };

      console.log(log);

      console.log(source, method, params);
    }

    if (method === "Network.responseReceived") {
      const targetUrl = await chrome.debugger
        .getTargets()
        .then(
          (targets) =>
            targets.find((target) => target?.tabId === source?.tabId)?.url,
        )
        .catch(() => console.error("Failed to get a URL of Debugger Target"));

      const { url, status, headers, mimeType } = params.response;

      if (getDomainName(targetUrl).includes(getDomainName(url))) {
        // ignore a request to same origin
        return;
      }

      console.log(log, params.requestId);

      log[params.requestId]["response"] = params.response;

      try {
        chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          async (response) => {
            if (response) {
              log[params.requestId].response = {
                ...log[params.requestId].response,
                body:
                  response?.body && mimeType === "application/json"
                    ? JSON.parse(response.body)
                    : response?.body,
              };
              chrome.storage.local.set({ key: log }).then(() => {
                console.log("Value is set", log);
              });

              port.postMessage("ready to download");
            } else {
              throw Error("Empty Response");
            }
          },
        );
      } catch (e) {
        console.log(error);
      }
    }
  });
});
