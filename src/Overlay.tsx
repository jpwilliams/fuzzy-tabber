import { Searcher, sortKind } from "fast-fuzzy";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TabEntry } from "./components/TabEntry";
import { useGetTabsQuery, useOpenTabMutation } from "./store/api/background";

export const Overlay: React.FC = () => {
  const { data } = useGetTabsQuery();
  const [openTab] = useOpenTabMutation();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const container = React.useRef<HTMLDivElement | null>(null);
  const [searchInput, setSearchInput] = React.useState("");

  const searcher = React.useMemo(() => {
    return new Searcher(data ?? [], {
      keySelector: (tab) => [tab.title ?? "", tab.url ?? ""].filter(Boolean),
      sortBy: sortKind.bestMatch,
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

  const selectedTabId = React.useMemo(() => {
    return searchedData?.[selectedIndex]?.id;
  }, [searchedData, selectedIndex]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [searchInput]);

  const onUpPress = React.useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

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

      setSelectedIndex((currIndex) => {
        const next = (currIndex + 1) % (searchedData ?? []).length;
        return next;
      });
    },
    [searchedData]
  );

  const onExit = React.useCallback(
    (event?: KeyboardEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const el = container.current;

      if (!el) {
        return;
      }

      const isVisible = !el.classList.contains("invisible");

      if (isVisible) {
        event?.preventDefault();
        event?.stopPropagation();
        el.classList.toggle("invisible");
      }
    },
    [container]
  );

  const selectEntry = (tabId?: number) => {
    // alert(`Selected: ${tabId}`);
    if (tabId) {
      openTab([tabId]);
    }

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

      selectEntry(selectedTabId);
    },
    {
      filterPreventDefault: true,
      enableOnTags: ["INPUT"],
    }
  );

  return (
    <div
      ref={container}
      id="__fuzzy_tabber_app_container"
      className="invisible fixed inset-0 z-[5000] select-none"
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onExit} />
      <div className="absolute inset-0 flex flex-col" onClick={onExit}>
        <div className="flex items-center justify-center pt-12">
          <div
            className="bg-slate-800 rounded-lg shadow-2xl p-4 text-white text-sm max-w-full w-[36rem] flex flex-col"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="pb-2 mb-2 shadow flex flex-row">
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
            {searchedData?.map((tab, index) => (
              <TabEntry
                key={index}
                title={tab.title || "No title"}
                url={tab.url || ""}
                faviconUrl={tab.favIconUrl}
                selected={index === selectedIndex}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => (tab.id ? selectEntry(tab.id) : undefined)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
