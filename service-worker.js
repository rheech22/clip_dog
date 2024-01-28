chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith("http")) {
    // attach debugger to target
    chrome.debugger.attach({ tabId: tab.id }, "1.3", () => {
      chrome.debugger.sendCommand(
        { tabId: tab.id },
        "Network.enable",
        {},
        () =>
          chrome.runtime.lastError && console.error(chrome.runtime.lastError),
      );
    });
  } else {
    console.log("Debugger can only be attached to HTTP/HTTPS pages.");
  }
});

// TODO: to util
const getDomainName = (url) => {
  return url.replace(/https?:\/\/([^\s\/:]+)(\S*$)/i, "$1");
};

chrome.debugger.onEvent.addListener(async (source, method, params) => {
  if (method === "Network.responseReceived") {
    let result = {};

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

    result = { url, status, headers };

    try {
      chrome.debugger.sendCommand(
        { tabId: source.tabId },
        "Network.getResponseBody",
        { requestId: params.requestId },
        (response) => {
          if (response) {
            result = {
              ...result,
              body:
                response?.body && mimeType === "application/json"
                  ? JSON.parse(response.body)
                  : response?.body,
            };

            console.log("Result:", result);
            // chrome.debugger.detach(source);
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
