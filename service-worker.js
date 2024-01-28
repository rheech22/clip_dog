chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith("http")) {
    // attach debugger to target
    // attatch = (target, requriedVersion, callback)
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

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.responseReceived") {
    console.log("Response Received:", params.response);

    chrome.debugger.sendCommand(
      // target
      { tabId: source.tabId },
      // method
      "Network.getResponseBody",
      // request params
      { requestId: params.requestId },
      // response body
      (response) => {
        console.log("Response Body:", JSON.parse(response.body));
        // chrome.debugger.detach(source);
      },
    );
  }
});
