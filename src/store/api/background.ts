import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import type { Api } from "../../background";

type Unionize<T> = T[keyof T];

type ApiArgs<T extends Api> = Unionize<{
  [K in keyof Api]: {
    method: K;
    args: Parameters<T[K]>;
  };
}>;

type QueryArgs = ApiArgs<Api>;

export const backgroundBaseQuery: BaseQueryFn<QueryArgs> = async (message) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (res) => {
      console.log("res:", res);
      resolve({ data: res });
    });
  });
};

export const backgroundApi = createApi({
  baseQuery: backgroundBaseQuery,
  endpoints: (build) => ({
    getTabs: build.query<Awaited<ReturnType<Api["getTabs"]>>, void>({
      query: () => ({
        method: "getTabs",
        args: [],
      }),
    }),
    openTab: build.mutation<void, Parameters<Api["openTab"]>>({
      query: (arg) => {
        return {
          method: "openTab",
          args: [arg[0]],
        };
      },
    }),
  }),
});

export const { useGetTabsQuery, useOpenTabMutation } = backgroundApi;
