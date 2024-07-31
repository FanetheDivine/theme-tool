'use client'

import { getEditedThemeMap, getEditedThemeVar, getTheme } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { Collapse, Typography } from "antd"
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
          <Typography.Title>主题变量</Typography.Title>
          <Typography.Text>主题变量</Typography.Text>
          <Typography.Title>变更</Typography.Title>
          <Typography.Text>主题变量</Typography.Text>
          <Typography.Title>应用变更的主题变量</Typography.Title>
          <Typography.Text>主题变量</Typography.Text>
        </Typography>
      )
    },
    {
      label: '主题映射及其变更',
      key: '2',
      children: (
        <Typography>
          <Typography.Title>主题映射</Typography.Title>
          <Typography.Text>主题映射</Typography.Text>
          <Typography.Title>变更</Typography.Title>
          <Typography.Text>主题映射</Typography.Text>
          <Typography.Title>应用变更的主题映射</Typography.Title>
          <Typography.Text>主题映射</Typography.Text>
        </Typography>
      )
    },
    {
      label: '应用变更的主题',
      key: '3',
      children: (
        <Typography>
          <Typography.Title>主题</Typography.Title>
          <Typography.Text>主题</Typography.Text>
          <Typography.Title>变更</Typography.Title>
          <Typography.Text>主题</Typography.Text>
          <Typography.Title>应用变更的主题</Typography.Title>
          <Typography.Text>主题</Typography.Text>
        </Typography>
      )
    }
  ]
  return <Collapse items={items} style={props.style} className={props.className}></Collapse>
}

// const MapRender