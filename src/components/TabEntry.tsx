import classNames from "classnames";
import React from "react";

interface Props {
  faviconUrl?: string;
  title: string;
  url: string;
  selected?: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

export const TabEntry: React.FC<Props> = ({
  faviconUrl,
  title,
  url,
  selected,
  onMouseEnter,
  onClick,
}) => {
  return (
    <div
      className={classNames({
        "flex flex-row p-2 gap-2 overflow-hidden rounded cursor-pointer items-center":
          true,
        "bg-slate-700": selected,
      })}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {faviconUrl ? <img src={faviconUrl} className="w-4 h-4 rounded" /> : null}
      <div className="truncate text-gray-500">
        <span className="font-semibold text-white">{title} </span>
        <span>- {url}</span>
      </div>
    </div>
  );
};
