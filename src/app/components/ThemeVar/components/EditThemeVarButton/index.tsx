import { getEditedThemeVar, checkThemeItemName, isEditedThemeItem, isOriginThemeItem, isDeletedThemeItem } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { EditOutlined, DeleteOutlined, UndoOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Modal, Card, Form, Input, Select, Divider, Typography } from "antd"
import { useForm, useWatch } from "antd/es/form/Form"
import classNames from "classnames"
import React, { FC, PropsWithChildren, ReactNode, useState } from "react"
import { DeleteThemeItemIcon } from "../DeleteThemeItemIcon"

/** 用于打开主题编辑弹窗 */
export const EditThemeVarButton = () => {
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const deletedItems = Array.from(themeInfo.themeVar.keys()).filter(name => isDeletedThemeItem(name, themeInfo.themeVarEditRecorder))
  return (
    <>
      <Button onClick={() => setOpen(true)} type='primary' icon={<EditOutlined></EditOutlined>}>编辑主题变量</Button>
      <Modal maskClosable={false} title={'编辑主题变量'} open={open} onCancel={() => setOpen(false)} footer={null}>
        <div className='flex flex-wrap'>
          {
            Array.from(editedThemeVar.entries()).map(([name]) => {
              return (
                <ThemeVarCard key={name} name={name}>
                  <DeleteThemeItemIcon name={name} />
                  {
                    isEditedThemeItem(name, themeInfo.themeVarEditRecorder)
                      ? <UndoOutlined title='撤销变更' onClick={() => edit.themeVar.undo(name)}></UndoOutlined>
                      : null
                  }
                </ThemeVarCard>
              )
            })
          }
          <AddThemeVarCard></AddThemeVarCard>
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

      </Modal>
    </>
  )
}

/** 用于展示单个主题元的卡片 */
const ThemeVarCard: FC<PropsWithChildren & { name: ReactNode, className?: string, onClick?: () => void }> = props => {
  return (
    <Card size='small' className={classNames('my-2 mx-4', props.className)} onClick={props.onClick}>
      <div className='flex gap-2 items-center'>
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

/** 增加一个主题元 */
const AddThemeVarCard: FC = () => {
  type FormValue = { name: string, desc: string } & ({ type: 'color', colorValue: string } | { type: 'string', stringValue: string } | { type: 'number', numberValue: number })
  const [form] = useForm<FormValue>()
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  const formType = useWatch('type', form)
  const type = formType ?? 'color'
  if (!themeInfo) return

  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const nameValidator = async (name: string) => {
    const varName = `@${name}`
    checkThemeItemName(varName)
    if (editedThemeVar.has(varName)) {
      throw new Error('主题元名称重复')
    }
  }

  const options = [
    { value: 'color', label: '颜色' },
    { value: 'string', label: '字符串' },
    { value: 'number', label: '数字' }
  ]

  const submit = (formValue: FormValue) => {
    const value = (() => {
      switch (formValue.type) {
        case 'color': return formValue.colorValue
        case "string": return formValue.stringValue
        case "number": return formValue.numberValue
      }
    })()
    edit.themeVar.add(`@${formValue.name}`, { desc: formValue.desc, value })
    setOpen(false)
  }

  return (
    <>
      <ThemeVarCard name={null} className='cursor-pointer' onClick={() => setOpen(true)}>
        <PlusOutlined></PlusOutlined>
      </ThemeVarCard>
      <Modal classNames={{ wrapper: '-top-16' }} maskClosable={false} title='添加主题元' footer={null} open={open} destroyOnClose onCancel={() => setOpen(false)}>
        <Form<FormValue> onFinish={submit} preserve={false} form={form} layout='vertical'>
          <Form.Item<FormValue> name={'name'} label='名称' validateFirst
            rules={[
              { required: true, message: '请填写名称' },
              { validator: (_, v) => nameValidator(v) }
            ]}
          >
            <Input prefix={'@'}></Input>
          </Form.Item>
          <Form.Item<FormValue> name={'desc'} label='描述' rules={[{ required: true, message: '请填写描述' }]}>
            <Input></Input>
          </Form.Item>
          <Form.Item<FormValue> name='type' label='类型' initialValue={'color'}>
            <Select options={options}></Select>
          </Form.Item>
          {
            (() => {
              switch (type) {
                case 'color': {
                  return (
                    <Form.Item<FormValue> name='colorValue' label='初始值' initialValue={'#4096fa'}>
                      <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                    </Form.Item>
                  )
                }
                case 'string': {
                  return (
                    <Form.Item<FormValue> name='stringValue' label='初始值' initialValue={''}>
                      <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                    </Form.Item>
                  )
                }
                case 'number': {
                  return (
                    <Form.Item<FormValue> name='numberValue' label='初始值' initialValue={0}>
                      <NumberValue value={0} onChange={() => { }}></NumberValue>
                    </Form.Item>
                  )
                }
                default:
                  return null
              }
            })()
          }
          <Form.Item>
            <Button type='primary' htmlType='submit' onClick={() => setOpen(false)}>确定</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>

  )
}