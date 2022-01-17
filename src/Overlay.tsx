import { Searcher, sortKind } from "fast-fuzzy";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TabEntry } from "./components/TabEntry";
import {
  useCloseTabMutation,
  useCurrentWindowQuery,
  useOpenTabMutation,
  useTabGroupsQuery,
  useTabsQuery,
} from "./store/api/background";

export const Overlay: React.FC = () => {
  const { data } = useTabsQuery();
  const [openTab] = useOpenTabMutation();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const entryContainer = React.useRef<HTMLDivElement | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [lastActionWasHover, setLastActionWasHover] = React.useState(false);
  const { data: currentWindow } = useCurrentWindowQuery();
  const { data: tabGroups } = useTabGroupsQuery();
  const [closeTab] = useCloseTabMutation();

  React.useEffect(() => {
    if (!lastActionWasHover) {
      const entries = entryContainer.current?.children;
      const entry = entries?.[selectedIndex];
      const yOffset = -64;
      const y =
        (entry?.getBoundingClientRect().top ?? 0) +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        behavior: "smooth",
        top: y,
      });
    }
  }, [selectedIndex, lastActionWasHover]);

  const searcher = React.useMemo(() => {
    return new Searcher(data ?? [], {
      keySelector: (tab) => [tab.title ?? "", tab.url ?? ""].filter(Boolean),
      // keySelector: (tab) => [tab.title ?? ""].filter(Boolean),
      sortBy: sortKind.bestMatch,
      ignoreCase: true,
      threshold: 0.8,
    });
  }, [data]);

  const searchedData = React.useMemo(() => {
    if (!searchInput) {
      return data;
    }

    return searcher.search(searchInput, {
      ignoreCase: true,
    });
  }, [searcher, searchInput]);

  const selectedTab = React.useMemo(() => {
    return searchedData?.[selectedIndex];
  }, [searchedData, selectedIndex]);

  React.useEffect(() => {
    setSelectedIndex(0);
    setLastActionWasHover(false);
  }, [searchInput]);

  const onUpPress = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setLastActionWasHover(false);

      setSelectedIndex((currIndex) => {
        const next = (currIndex - 1) % (searchedData ?? []).length;
        return next >= 0 ? next : Math.max(0, (searchedData ?? []).length - 1);
      });
    },
    [searchedData]
  );

  const onDownPress = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setLastActionWasHover(false);

      setSelectedIndex((currIndex) => {
        const next = (currIndex + 1) % (searchedData ?? []).length;
        return next;
      });
    },
    [searchedData]
  );

  const onCtrlDownPress = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!selectedTab) {
        return;
      }

      closeTab(selectedTab);
    },
    [selectedTab]
  );

  const onCtrlLeftPress = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (selectedTab) {
        selectEntry({ tab: selectedTab, bringTabToWindow: true });
      }
    },
    [selectedTab]
  );

  const onExit = React.useCallback(() => {
    window.close();
  }, []);

  const selectEntry = (...args: Parameters<typeof openTab>) => {
    openTab(...args);
    onExit();
  };

  useHotkeys(
    "up",
    onUpPress,
    {
      filterPreventDefault: true,
      enableOnTags: ["INPUT"],
    },
    [searchedData]
  );

  useHotkeys(
    "down",
    onDownPress,
    {
      filterPreventDefault: true,
      enableOnTags: ["INPUT"],
    },
    [searchedData]
  );

  useHotkeys("esc", onExit, {
    filterPreventDefault: true,
    enableOnTags: ["INPUT"],
  });

  useHotkeys(
    "enter",
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (selectedTab) {
        selectEntry({ tab: selectedTab });
      }
    },
    {
      filterPreventDefault: true,
      enableOnTags: ["INPUT"],
    }
  );

  useHotkeys("ctrl+down", onCtrlDownPress, {
    filterPreventDefault: true,
    enableOnTags: ["INPUT"],
  });

  useHotkeys("ctrl+left", onCtrlLeftPress, {
    filterPreventDefault: true,
    enableOnTags: ["INPUT"],
  });

  return (
    <div className="select-none w-full h-full">
      <div className="flex flex-col w-full h-full" onClick={onExit}>
        <div
          className="bg-slate-800 text-white text-sm max-w-full w-[36rem] flex flex-col overflow-hidden relative"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="fixed pb-2 mb-2 flex flex-row w-full z-10">
            <div className="flex-1 pt-4 bg-slate-800 px-4 flex flex-row">
              <input
                id="__fuzzy_tabber_app_input"
                type="text"
                placeholder="Search tabs..."
                className="outline outline-4 outline-offset-0 outline-blue-400 text-black font-semibold rounded-lg p-2 text-md flex-1"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Up") {
                    onUpPress(e as unknown as KeyboardEvent);
                  } else if (e.key === "Down") {
                    onDownPress(e as unknown as KeyboardEvent);
                  }
                }}
              />
            </div>
          </div>
          <div className="relative w-full h-full overflow-hidden pb-2">
            <div ref={entryContainer} className="mt-16">
              {searchedData?.map((tab, index) => (
                <TabEntry
                  key={index}
                  title={tab.title || "No title"}
                  url={tab.url || ""}
                  faviconUrl={tab.favIconUrl}
                  selected={index === selectedIndex}
                  onMouseEnter={() => {
                    setLastActionWasHover(true);
                    setSelectedIndex(index);
                  }}
                  onClick={() => (tab.id ? selectEntry({ tab }) : undefined)}
                  differentWindow={
                    currentWindow && tab.windowId !== currentWindow.id
                  }
                  tabGroup={
                    tab.groupId
                      ? tabGroups?.find((group) => group.id === tab.groupId)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
