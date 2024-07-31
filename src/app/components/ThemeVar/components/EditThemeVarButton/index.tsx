import { getEditedThemeVar, checkThemeItemName } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { EditOutlined, DeleteOutlined, UndoOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Modal, Card, Form, Input, Select } from "antd"
import { useForm, useWatch } from "antd/es/form/Form"
import { useState } from "react"

/** 用于打开主题编辑弹窗 */
export const EditThemeVarButton = () => {
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  return (
    <>
      <Button onClick={() => setOpen(true)} type='primary' icon={<EditOutlined></EditOutlined>}>编辑主题变量</Button>
      <Modal maskClosable={false} title={'编辑主题变量'} open={open} onCancel={() => setOpen(false)} footer={null}>
        <div className='flex flex-wrap'>
          {
            editedThemeVar.entries().toArray().map(([name]) => {
              const editType = themeInfo.themeVarEditRecorder.get(name)?.type
              const isEdited = editType === 'change' || editType === 'descChange'
              return (
                <Card key={name} size='small' className='my-2 mx-4'>
                  <div className='flex gap-2 items-center'>
                    <span className='text-xl'>{name}</span>
                    <EditSingleThemeVarIcon name={name}></EditSingleThemeVarIcon>
                    <DeleteOutlined title='删除变量' onClick={() => edit.themeVar.delete(name)}></DeleteOutlined>
                    {
                      isEdited
                        ? <UndoOutlined title='撤销变更' onClick={() => edit.themeVar.undo(name)}></UndoOutlined>
                        : null
                    }
                  </div>
                </Card>
              )
            })
          }
          <AddThemeVarCard className='my-2 mx-4 cursor-pointer' ></AddThemeVarCard>
        </div>
      </Modal>
    </>
  )
}

/** 增加一个主题元 */
const AddThemeVarCard = (props: { className?: string }) => {
  const [form] = useForm()
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  const type = useWatch('type', form) ?? 'color'
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

  const submit = (value: any) => {
    const formValue = value as { name: string, desc: string } & ({ type: 'string' | 'color', value: string } | { type: 'number', value: number })
    edit.themeVar.add(`@${formValue.name}`, { desc: formValue.desc, value: formValue.value })
    setOpen(false)
  }

  return (
    <>
      <Card size='small' className={props.className} onClick={() => setOpen(true)}>
        <PlusOutlined></PlusOutlined>
      </Card>
      <Modal classNames={{ wrapper: '-top-16' }} maskClosable={false} title='添加主题元' footer={null} open={open} destroyOnClose onCancel={() => setOpen(false)}>
        <Form onFinish={submit} preserve={false} form={form} layout='vertical'>
          <Form.Item name={'name'} label='名称' validateFirst
            rules={[
              { required: true, message: '请填写名称' },
              { validator: (_, v) => nameValidator(v) }
            ]}
          >
            <Input prefix={'@'}></Input>
          </Form.Item>
          <Form.Item name={'desc'} label='描述' rules={[{ required: true, message: '请填写描述' }]}>
            <Input></Input>
          </Form.Item>
          <Form.Item name='type' label='类型' initialValue={'color'}>
            <Select options={options}></Select>
          </Form.Item>
          {
            (() => {
              switch (type) {
                case 'color': {
                  return (
                    <Form.Item name='value' label='初始值' initialValue={'#4096fa'}>
                      <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                    </Form.Item>
                  )
                }
                case 'string': {
                  return (
                    <Form.Item name='value' label='初始值' initialValue={''}>
                      <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                    </Form.Item>
                  )
                }
                case 'number': {
                  return (
                    <Form.Item name='value' label='初始值' initialValue={0}>
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


/** 编辑单个主题元 */
const EditSingleThemeVarIcon = (props: { name: string }) => {
  return <EditOutlined title={props.name}></EditOutlined>
}