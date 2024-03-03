export type Log = Record<string, { request?: object; response?: object }>;

export type Params = {
  requestId: string;
  request: {
    url: string;
    urlFragment?: string;
    method: string;
    headers: Record<string, string>;
  };
  resourceType: string;
  responseStatusCode?: number;
  responseStatusText?: string;
  responseHeaders?: { name: string; value: string }[];
  networkId?: string;
  redirectedRequestId?: string;
  response: {
    mimeType: string;
    url: string;
  };
};

export type Response = { body?: string } | undefined;

export type MessageListener<M, R> = (
  message: M,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: R) => void,
) => void;
