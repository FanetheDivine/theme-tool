'use client'

import { getThemeMapByKey, isDeletedThemeMap } from "@/lib/Theme";
import { useTheme } from "@/utils/theme";
import { EditOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Divider, Popover, Typography } from "antd";
import { FC, Fragment } from "react";
import { UndoThemeMapIcon } from "../UndoThemeMapIcon";

export const DeletedThemeMapButton: FC = () => {
  const { themeInfo } = useTheme()
  if (!themeInfo) return null
  const deletedThemeMapKeys = Array.from(themeInfo.themeMapEditRecorder.keys())
    .filter(themeMapKey => isDeletedThemeMap(themeMapKey, themeInfo.themeMap, themeInfo.themeMapEditRecorder))
  const deletedThemeMap = deletedThemeMapKeys
    .map(themeMapKey => [themeMapKey, getThemeMapByKey(themeInfo.themeMap, themeMapKey)] as const)
    .filter(([_, themeMap]) => themeMap)
  const content = (
    <div className='flex flex-col min-w-40 max-h-[40vh] overflow-auto'>
      <Divider className='my-2'></Divider>
      {
        deletedThemeMap.map(([themeMapKey, themeMap]) => {
          return (
            <Fragment key={themeMapKey}>
              <div className='flex gap-2 items-center'>
                <span>{themeMapKey}</span>
                <UndoThemeMapIcon themeMapKey={themeMapKey}></UndoThemeMapIcon>
              </div>
              <Typography.Text>{themeMap?.desc}</Typography.Text>
              <Divider className='my-2'></Divider>
            </Fragment>
          )
        })
      }
    </div>
  )
  return deletedThemeMap.length === 0
    ? null
    : (
      <Popover trigger={'click'} content={content} placement='top'>
        <Button type='primary' icon={<UpOutlined />}>编辑主题映射</Button>
      </Popover>
    )
}