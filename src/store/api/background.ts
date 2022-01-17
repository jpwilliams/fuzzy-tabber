import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";

type KeysNotOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P;
}[keyof T];

/**
 * Filter out keys of T to only those that extend type U.
 */
export type OmitAllButType<T, U> = Pick<
  T,
  Exclude<keyof T, KeysNotOfType<T, U>>
>;

export const backgroundBaseQuery: BaseQueryFn = async (message) => {
  return { data: undefined };
};

export const backgroundApi = createApi({
  baseQuery: backgroundBaseQuery,
  endpoints: (build) => ({
    tabs: build.query<chrome.tabs.Tab[], void>({
      queryFn: async () => {
        const data = await chrome.tabs.query({});
        return { data };
      },
      onCacheEntryAdded: async (
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) => {
        const action = backgroundApi.endpoints.tabs.initiate(arg, {
          forceRefetch: true,
        });

        const listener = () => void dispatch(action);
        const events: (keyof OmitAllButType<
          typeof chrome.tabs,
          chrome.events.Event<any>
        >)[] = ["onCreated", "onRemoved"];

        try {
          await cacheDataLoaded;
          events.forEach((event) => chrome.tabs[event].addListener(listener));
        } catch {
          // ignore
        }

        await cacheEntryRemoved;

        events.forEach((event) => {
          chrome.tabs[event].removeListener(listener);
        });
      },
    }),
    currentWindow: build.query<chrome.windows.Window, void>({
      queryFn: async () => {
        const data = await chrome.windows.getCurrent();
        return { data };
      },
    }),
    tabGroups: build.query<chrome.tabGroups.TabGroup[], void>({
      queryFn: async () => {
        const data = await chrome.tabGroups.query({});
        return { data };
      },
    }),
    openTab: build.mutation<
      void,
      { tab: chrome.tabs.Tab; bringTabToWindow?: boolean }
    >({
      queryFn: async ({ tab, bringTabToWindow }) => {
        if (!tab.id) {
          return { data: undefined };
        }

        if (bringTabToWindow) {
          const curWindow = await chrome.windows.getCurrent();

          chrome.tabs.move(tab.id, {
            windowId: curWindow.id,
            index: -1,
          });

          chrome.tabs.update(tab.id, {
            active: true,
            highlighted: true,
          });
        } else {
          chrome.tabs.update(tab.id, {
            active: true,
            highlighted: true,
          });

          chrome.windows.update(tab.windowId, {
            focused: true,
          });
        }

        return { data: undefined };
      },
    }),
    closeTab: build.mutation<boolean, chrome.tabs.Tab>({
      queryFn: async (tab) => {
        if (!tab.id) {
          return { data: false };
        }

        chrome.tabs.remove(tab.id);

        return { data: true };
      },
    }),
  }),
});

export const {
  useTabsQuery,
  useOpenTabMutation,
  useCurrentWindowQuery,
  useTabGroupsQuery,
  useCloseTabMutation,
} = backgroundApi;
