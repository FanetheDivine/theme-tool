'use client'

import classNames from "classnames";
import { FC } from "react";
import { EditThemeMapButton } from "./components/EditThemeMapButton";
import { ThemeMapRender } from "./components/ThemeMapRender";

export const ThemeMap: FC<{ className?: string }> = props => {
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <ThemeMapRender className='flex-auto'></ThemeMapRender>
      <EditThemeMapButton></EditThemeMapButton>
    </div>
  )
}