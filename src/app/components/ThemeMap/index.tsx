'use client'

import classNames from "classnames";
import { FC } from "react";
import { DeletedThemeMapButton } from "./components/DeletedThemeMapButton";
import { ThemeMapRender } from "./components/ThemeMapRender";

export const ThemeMap: FC<{ className?: string }> = props => {
  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <ThemeMapRender className='flex-auto'></ThemeMapRender>
      <DeletedThemeMapButton></DeletedThemeMapButton>
    </div>
  )
}