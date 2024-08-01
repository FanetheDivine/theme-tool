import { getEditedThemeVar, isEditedThemeItem, isDeletedThemeItem } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { EditOutlined, UndoOutlined } from "@ant-design/icons"
import { Button, Modal, Card, Divider, Typography } from "antd"
import classNames from "classnames"
import React, { FC, PropsWithChildren, ReactNode, useState } from "react"
import { DeleteThemeItemIcon } from "../DeleteThemeItemIcon"
import { AddThemeItemButton } from "../AddThemeItemIcon"

/** 用于打开主题编辑弹窗 */
export const EditThemeVarButton = () => {
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const deletedItems = Array.from(themeInfo.themeVar.keys()).filter(name => isDeletedThemeItem(name, themeInfo.themeVar, themeInfo.themeVarEditRecorder))
  return (
    <>
      <Button onClick={() => setOpen(true)} type='primary' icon={<EditOutlined></EditOutlined>}>编辑主题变量</Button>
      <Modal maskClosable={false} title={'编辑主题变量'} open={open} onCancel={() => setOpen(false)} footer={null}>
        <div className='flex flex-wrap'>
          {
            Array.from(editedThemeVar.entries()).map(([name]) => {
              return (
                <ThemeVarCard key={name} name={name}>
                  <DeleteThemeItemIcon className='text-sm' name={name} />
                  {
                    isEditedThemeItem(name, themeInfo.themeVarEditRecorder)
                      ? <UndoOutlined className='text-sm' title='撤销变更' onClick={() => edit.themeVar.undo(name)}></UndoOutlined>
                      : null
                  }
                </ThemeVarCard>
              )
            })
          }
          <ThemeVarCard>
            <AddThemeItemButton className='text-xl' />
          </ThemeVarCard>
        </div>
        {
          deletedItems.length !== 0
            ? (
              <>
                <Divider></Divider>
                <Typography.Title level={5}>已删除的变量</Typography.Title>
                <div className='flex flex-wrap'>
                  {
                    deletedItems.map((name) => {
                      return (
                        <ThemeVarCard key={name} name={name}>
                          <UndoOutlined title={'撤销删除'} onClick={() => edit.themeVar.undo(name)}></UndoOutlined>
                        </ThemeVarCard>
                      )
                    })
                  }
                </div>
              </>
            )
            : null
        }

      </Modal >
    </>
  )
}

/** 用于展示单个主题元的卡片 */
const ThemeVarCard: FC<PropsWithChildren & { name?: ReactNode, className?: string, onClick?: () => void }> = props => {
  return (
    <Card size='small' className={classNames('my-2 mx-4', props.className)} onClick={props.onClick}>
      <div className='flex gap-2 items-end'>
        {
          props.name
            ? <span className='text-xl'>{props.name}</span>
            : null
        }
        {props.children}
      </div>
    </Card>
  )
}