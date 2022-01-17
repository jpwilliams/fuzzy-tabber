type QueryMethod = "getTabs";

let currentTabs: chrome.tabs.Tab[] = [];

const createApi = <T extends Record<QueryMethod, (...args: any[]) => any>>(
  obj: T
) => obj;

export const api = createApi({
  getTabs: async () => {
    console.log("background got getTabs req");
    return currentTabs;
  },
  openTab: async (tabId: number) => {
    console.log("opening a tab");

    chrome.tabs.update(tabId, {
      active: true,
    });
  },
});

export type Api = typeof api;

const main = async () => {
  const refreshTabs = async () => {
    currentTabs = await chrome.tabs.query({});
    console.log("currentTabs:", currentTabs);
  };

  chrome.tabs.onAttached.addListener(() => {
    refreshTabs();
  });

  chrome.tabs.onCreated.addListener(() => {
    refreshTabs();
  });

  chrome.tabs.onRemoved.addListener(() => {
    refreshTabs();
  });

  chrome.tabs.onUpdated.addListener(() => {
    refreshTabs();
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("background got message:", message);

    const { method, args } = message as {
      method: keyof typeof api;
      args: any[];
    };

    (api[method] as any)(...args)
      .then(sendResponse)
      .catch(() => {
        sendResponse({ error: "Fail" });
      });

    return true;
  });
};

const toggle = () => {
  const el = document.getElementById("__fuzzy_tabber_app_container");
  const input = document.getElementById(
    "__fuzzy_tabber_app_input"
  ) as HTMLInputElement;

  el?.classList.toggle("invisible");
  input?.focus();
  input.value = "";
};

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggle,
    });
  }
});

main();
