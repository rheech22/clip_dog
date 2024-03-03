export async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}

export const createPort = (name: string) => {
  return chrome.runtime.connect({ name });
};

export const getStorageItem = async (key: string) => {
  return await chrome.storage.local.get([key]);
};

export const setSessionItem = async <T>(key: string, value: T) => {
  await chrome.storage.session.set({ [key]: value });
};

export const getSessionItem = async (key: string) => {
  const result = await chrome.storage.session.get([key]);

  return result[key];
};

export const attachDebugger = (tabId: number) => {
  chrome.debugger.attach({ tabId }, "1.3", () => {
    chrome.debugger.sendCommand(
      { tabId },
      "Network.enable",
      {},
      () => chrome.runtime.lastError && console.error(chrome.runtime.lastError),
    );
  });
  console.log("Debugger is attached");
};

export const detachDebugger = (tabId: number) => {
  chrome.debugger.detach({ tabId });
  console.log("Debugger is detached");
};
