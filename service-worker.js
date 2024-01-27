chrome.action.onClicked.addListener(function (tab) {
  if (tab.url.startsWith("http")) {
    chrome.debugger.attach({ tabId: tab.id }, "1.3", function () {
      chrome.debugger.sendCommand(
        { tabId: tab.id },
        "Network.enable",
        {},
        function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        },
      );
    });
  } else {
    console.log("Debugger can only be attached to HTTP/HTTPS pages.");
  }
});

chrome.debugger.onEvent.addListener(function (source, method, params) {
  if (
    method === "Network.responseReceived" &&
    params.response.url.endsWith("/graphql/")
  ) {
    console.log("Graphql Response Received:", params.response);
    chrome.debugger.sendCommand(
      {
        tabId: source.tabId,
      },
      "Network.getResponseBody",
      {
        requestId: params.requestId,
      },
      function (response) {
        console.log("Response Body:", JSON.parse(response.body));
        // chrome.debugger.detach(source);
      },
    );
  }
});
