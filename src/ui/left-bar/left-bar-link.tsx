import type { ReactNode } from 'react';
import React from 'react';
import { NavLink } from 'react-router';
import { LeftBarTooltip } from './left-bar-tooltip';

type Props = {
  // A function can be provided to render an icon that depends on the link's active state.
  icon: ReactNode | ((isActive: boolean) => ReactNode);
  tooltip: ReactNode;
  url: string;
  // Optional text displayed under the icon, truncated since the left bar is narrow.
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

export function LeftBarLink({ url, tooltip, icon, label, onClick }: Props) {
  return (
    <LeftBarTooltip content={tooltip}>
      <NavLink
        to={url}
        onClick={onClick}
        className={({ isActive }) => {
          return `flex flex-col items-center w-full no-underline hover:text-gray-900 duration-85 transition-all py-12 outline-hidden ${
            isActive ? 'text-gray-900' : 'text-gray-500'
          }`;
        }}
        viewTransition={true}
      >
        {({ isActive }) => {
          return (
            <>
              <div className="flex w-32 justify-center">{typeof icon === 'function' ? icon(isActive) : icon}</div>
              {label !== undefined && <p className="mt-4 w-full truncate px-4 text-center text-caption">{label}</p>}
            </>
          );
        }}
      </NavLink>
    </LeftBarTooltip>
  );
}
