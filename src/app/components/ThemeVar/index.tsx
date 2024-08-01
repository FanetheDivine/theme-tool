'use client'

import { useTheme } from "@/utils/theme";
import { CSSProperties, FC, Fragment } from "react";
import classNames from "classnames";
import { Divider, Tooltip, Typography, } from "antd";
import { ThemeItemValueRender } from "@/app/components/ThemeVar/components/ThemeItemValueRender";
import { getEditedThemeVar, isEditedThemeItem, isOriginThemeItem } from "@/lib/Theme";
import { EditThemeVarButton } from "./components/EditThemeVarButton";
import { InfoCircleOutlined, UndoOutlined } from "@ant-design/icons";
import { DeleteThemeItemIcon } from "./components/DeleteThemeItemIcon";
import { AddThemeItemButton } from "./components/AddThemeItemIcon";
import { UndoThemeItemIcon } from "./components/UndoThemeItemIcon";

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
          Array.from(editedThemeVar.entries()).map(([name, item]) => {
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
        <div className='flex justify-center'>
          <AddThemeItemButton className='text-2xl' />
        </div>
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
    <Typography.Title className='flex gap-2 items-end my-0' level={5}>
      <span className='text-xl'>{props.name}</span>
      {
        !isOriginThemeItem(props.name, themeInfo.themeVar, themeInfo.themeVarEditRecorder)
          ? (
            <Tooltip title={'这个主题元不在初始的主题变量中'}>
              <InfoCircleOutlined className='text-xs'></InfoCircleOutlined>
            </Tooltip>
          )
          : null
      }
      <DeleteThemeItemIcon className='text-sm' name={props.name} />
      {
        isEditedThemeItem(props.name, themeInfo.themeVarEditRecorder)
          ? <UndoThemeItemIcon name={props.name}></UndoThemeItemIcon>
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