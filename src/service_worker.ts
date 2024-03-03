import { attachDebugger, detachDebugger } from "./ex";
import { Log, Params, Response } from "./ex/types";
import { getDomainFromURL } from "./utils";

const methods = ["START", "END"];

const log: Log = {};

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    const { tab, method } = msg;

    console.log("get message from popup", tab, method);

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

  chrome.debugger.onEvent.addListener(async (source, method, _params) => {
    const params = _params as Params;

    if (method === "Network.requestWillBeSent") {
      const { request, requestId } = params;

      log[requestId] = { request };

      console.log(log[requestId]);
    }

    if (method === "Network.responseReceived") {
      const targetUrl = await chrome.debugger
        .getTargets()
        .then(
          (targets) =>
            targets.find((target) => target?.tabId === source?.tabId)?.url,
        )
        .catch(() => console.error("Failed to get a URL of Debugger Target"));

      const { url, mimeType } = params.response;

      if (
        targetUrl &&
        getDomainFromURL(targetUrl).includes(getDomainFromURL(url))
      ) {
        return;
      }

      log[params.requestId]["response"] = params.response;

      try {
        chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          async (_response) => {
            const response = _response as Response;

            if (response) {
              log[params.requestId].response = {
                ...log[params.requestId].response,
                body:
                  response?.body && mimeType === "application/json"
                    ? JSON.parse(response.body)
                    : response?.body,
              };

              //               chrome.storage.local.set({ key: log }).then(() => {
              //                 console.log("Value is set", log);
              //               });

              port.postMessage("ready to download");
            } else {
              throw Error("Empty Response");
            }
          },
        );
      } catch (e) {
        console.log(e);
      }
    }
  });
});
