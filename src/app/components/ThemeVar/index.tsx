'use client'

import { useTheme } from "@/utils/theme";
import { CSSProperties, FC, Fragment } from "react";
import classNames from "classnames";
import { Divider, } from "antd";
import { ThemeItemValueRender } from "@/app/components/ThemeVar/components/ThemeItemValueRender";
import { getEditedThemeVar } from "@/lib/Theme";
import { EditThemeVarButton } from "./components/EditThemeVarButton";

type ThemeVarProps = {
  className?: string,
  style?: CSSProperties
}

export const ThemeVar: FC<ThemeVarProps> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  return (
    <div style={props.style} className={classNames(props.className, 'flex flex-col')}>
      <div className='flex-auto flex flex-col overflow-auto'>
        {
          editedThemeVar.entries().toArray().map(([name, item]) => {
            return (
              <Fragment key={name}>
                <div className='flex flex-col'>
                  <span>{name}</span>
                  <span>{item.desc}</span>
                  <Divider className='my-2'></Divider>
                  <ThemeItemValueRender value={item.value} onChange={v => edit.themeVar.change(name, v)}></ThemeItemValueRender>
                </div>
                <Divider className='my-2'></Divider>
              </Fragment>
            )
          })
        }
      </div>
      <EditThemeVarButton></EditThemeVarButton>
    </div>
  )
}
