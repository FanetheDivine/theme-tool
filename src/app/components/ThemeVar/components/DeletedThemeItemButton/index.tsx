import { isDeletedThemeItem } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { UpOutlined } from "@ant-design/icons"
import { Button, Divider, Popover, Empty, Typography } from "antd"
import React, { Fragment, ReactNode } from "react"
import { UndoThemeItemIcon } from "../UndoThemeItemIcon"

/** 展示已删除的主题元 */
export const DeletedThemeItemButton = () => {
  const { themeInfo } = useTheme()
  if (!themeInfo) return null
  const deletedItems = Array.from(themeInfo.themeVar.entries()).filter(([name]) => isDeletedThemeItem(name, themeInfo.themeVar, themeInfo.themeVarEditRecorder))
  const content = (
    <div className='flex flex-col w-40 max-h-[40vh] overflow-auto'>
      <Divider className='my-2'></Divider>
      {
        deletedItems.map(([name, item]) => {
          return (
            <Fragment key={name}>
              <div className='flex gap-2 items-end'>
                <span className='text-xl'>{name}</span>
                <UndoThemeItemIcon name={name}></UndoThemeItemIcon>
              </div>
              <Typography.Text>{item.desc}</Typography.Text>
              <Divider className='my-2'></Divider>
            </Fragment>
          )
        })
      }
    </div>
  )
  return deletedItems.length === 0
    ? null
    : (
      <Popover trigger={'click'} content={content} placement='top'>
        <Button type='primary' disabled={deletedItems.length === 0} icon={<UpOutlined />}>已删除的主题变量</Button>
      </Popover>
    )
}