'use client'

import { useTheme } from "@/utils/theme";
import { CSSProperties, FC, Fragment } from "react";
import classNames from "classnames";
import { Divider, Typography, } from "antd";
import { ThemeItemValueRender } from "@/app/components/ThemeVar/components/ThemeItemValueRender";
import { getEditedThemeVar, isEditedThemeItem } from "@/lib/Theme";
import { EditThemeVarButton } from "./components/EditThemeVarButton";
import { UndoOutlined } from "@ant-design/icons";

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
                  <ThemeItemName name={name}></ThemeItemName>
                  <ThemeItemDesc name={name} />
                  <Divider className='my-2'></Divider>
                  <ThemeItemValueRender value={item.value} onChange={v => edit.themeVar.changeValue(name, v)}></ThemeItemValueRender>
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

/** 主题元名称 具有撤回变更功能 */
const ThemeItemName: FC<{ name: string }> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  return (
    <Typography.Title className='flex gap-2 items-center' level={5}>{props.name}
      {
        isEditedThemeItem(props.name, themeInfo.themeVarEditRecorder)
          ? <UndoOutlined title='撤销变更' className='text-sm' onClick={() => edit.themeVar.undo(props.name)}></UndoOutlined>
          : null
      }
    </Typography.Title>
  )
}

/** 可编辑的简介 */
const ThemeItemDesc: FC<{ name: string }> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const desc = editedThemeVar.get(props.name)?.desc
  return (
    <Typography.Text editable={{
      triggerType: ['icon'],
      onChange: newDesc => edit.themeVar.changeDesc(props.name, newDesc)
    }}
    >
      {desc}
    </Typography.Text>
  )
}