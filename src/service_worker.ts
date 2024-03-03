import type { Log, Params, Response } from "./chrome/types";
import {
  addDebuggerListener,
  addMessageListener,
  attachDebugger,
  detachDebugger,
} from "./chrome";

import { getDomainFromURL } from "./utils";
import { Method } from "./constants";

addMessageListener((message, _, sendMessage) => {
  const { tab, method } = message;

  if (!tab) {
    sendMessage({
      request_method: method,
      description: "tab not found",
      error: true,
      ok: false,
    });
    return;
  }

  if (!tab.url.startsWith("http")) {
    sendMessage({
      request_method: method,
      description: "Debugger can only be attached to HTTP/HTTPS pages.",
      error: true,
      ok: false,
    });
    return;
  }

  if (!Object.values(Method).includes(method)) {
    sendMessage({
      request_method: method,
      description: "invalid method",
      error: true,
      ok: false,
    });
    return;
  }

  if (method === Method.IsDebuggee) {
    chrome.debugger.getTargets((targets) => {
      const isDebuggee = targets.some(
        ({ tabId, attached }) => tabId === tab.id && attached === true,
      );

      sendMessage({
        request_method: method,
        result: isDebuggee,
        description: `isDebuggee is ${isDebuggee}`,
        ok: true,
        error: false,
      });
    });

    return true;
  }

  if (method === Method.End) {
    detachDebugger(tab.id);

    sendMessage({
      request_method: method,
      description: "detached",
      ok: true,
      error: false,
    });
    return;
  }

  if (method === Method.Start) {
    chrome.debugger.getTargets((targets) => {
      const isDebuggee = targets.some(
        ({ tabId, attached }) => tabId === tab.id && attached === true,
      );

      if (isDebuggee) {
        sendMessage({
          request_method: method,
          description: "this tab is already attached",
          error: true,
          ok: false,
        });
        return;
      }

      attachDebugger(tab.id);

      sendMessage({
        request_method: method,
        description: "attached",
        ok: true,
        error: false,
      });
    });

    return true;
  }
});

const log: Log = {};

addDebuggerListener(async (source, method, _params) => {
  const params = _params as Params;

  if (method === "Network.requestWillBeSent") {
    const { request, requestId } = params;

    log[requestId] = { request };

    console.log("Network.requestWillBeSent", log[requestId]);
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
