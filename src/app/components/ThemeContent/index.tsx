'use client'

import { getEditedThemeMap, getEditedThemeVar, getTheme, PropertyMap, ThemeMap, ThemeMapEditRecorder, ThemeMapItemBaseType } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { themeMapEditRecorderToObj, themeMapToObj, themeToObj, themeVarEditRecorderToObj, themeVarToObj } from "@/utils/themeCommonFn"
import { Collapse, Typography } from "antd"
import classNames from "classnames"
import { CSSProperties, FC } from "react"

type ThemeContentProps = {
  style?: CSSProperties,
  className?: string
}

export const ThemeContent: FC<ThemeContentProps> = props => {
  const { themeInfo } = useTheme()
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const editedThemeMap = getEditedThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder)
  const editedTheme = getTheme(editedThemeVar, editedThemeMap)
  const items = [
    {
      label: '主题变量及其变更',
      key: '1',
      children: (
        <Typography>
          <Typography.Title level={5}>主题变量</Typography.Title>
          <FormatterObj value={themeVarToObj(themeInfo.themeVar)}></FormatterObj>
          <Typography.Title level={5}>变更</Typography.Title>
          <FormatterObj value={themeVarEditRecorderToObj(themeInfo.themeVarEditRecorder)}></FormatterObj>
          <Typography.Title level={5}>应用变更的主题变量</Typography.Title>
          <FormatterObj value={themeVarToObj(editedThemeVar)}></FormatterObj>
        </Typography>
      )
    },
    {
      label: '主题映射及其变更',
      key: '2',
      children: (
        <Typography>
          <Typography.Title level={5}>主题映射</Typography.Title>
          <FormatterObj value={themeMapToObj(themeInfo.themeMap)}></FormatterObj>
          <Typography.Title level={5}>变更</Typography.Title>
          <FormatterObj value={themeMapEditRecorderToObj(themeInfo.themeMapEditRecorder)}></FormatterObj>
          <Typography.Title level={5}>应用变更的主题映射</Typography.Title>
          <FormatterObj value={themeMapToObj(editedThemeMap)}></FormatterObj>
        </Typography>
      )
    },
    {
      label: '应用变更的主题',
      key: '3',
      children: (
        <Typography>
          <FormatterObj value={themeToObj(editedTheme)}></FormatterObj>
        </Typography>
      )
    }
  ]
  return <Collapse items={items} defaultActiveKey={items.map(item => item.key)} style={props.style} className={classNames('overflow-auto', props.className)}></Collapse>
}

/** 展示格式化对象 */
const FormatterObj: FC<{ value: any }> = props => {
  return (
    <code className='max-h-[40vh] block overflow-auto whitespace-pre'>
      {JSON.stringify(props.value, null, 2)}
    </code>
  )
}