import classNames from "classnames";
import React from "react";

interface Props {
  faviconUrl?: string;
  title: string;
  url: string;
  selected?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
  className?: string;
  differentWindow?: boolean;
  tabGroup?: chrome.tabGroups.TabGroup;
}

export const TabEntry: React.FC<Props> = ({
  faviconUrl,
  title,
  url,
  selected,
  onMouseEnter,
  onClick,
  className,
  differentWindow,
  tabGroup,
}) => {
  return (
    <div
      className={classNames({
        [className ?? ""]: true,
      })}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div
        className={classNames({
          "flex flex-row mx-2 p-2 gap-2 overflow-hidden rounded cursor-pointer items-center":
            true,
          "bg-slate-700": selected,
        })}
      >
        {faviconUrl ? (
          <img src={faviconUrl} className="w-4 h-4 rounded" />
        ) : null}
        <div className="truncate text-gray-500">
          <span className="font-semibold text-white">{title} </span>
          <span>- {url}</span>
        </div>
        <div className="flex-1" />
        {tabGroup ? (
          <div
            className={classNames({
              [`items-center bg-group-${tabGroup.color} text-white rounded px-1 flex flex-row whitespace-nowrap text-xs`]:
                true,
              "h-4 w-4 px-2": !tabGroup.title,
            })}
          >
            {tabGroup.title || " "}
          </div>
        ) : null}
        {differentWindow ? (
          <div className="items-center bg-slate-600 text-white rounded px-1 flex flex-row whitespace-nowrap text-xs">
            Other window
          </div>
        ) : null}
      </div>
    </div>
  );
};
