import { getEditedThemeVar, checkThemeItemName } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { PlusCircleOutlined } from "@ant-design/icons"
import { Modal, Input, Select, Button, Form } from "antd"
import { FC, useState } from "react"

type AddThemeItemButtonProps = {
  className?: string
}

/** 增加一个主题元 */
export const AddThemeItemButton: FC<AddThemeItemButtonProps> = props => {
  type FormValue = { name: string, desc: string } & ({ type: 'color', colorValue: string } | { type: 'string', stringValue: string } | { type: 'number', numberValue: number })
  const [form] = Form.useForm<FormValue>()
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  const formType = Form.useWatch('type', form)
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
      <PlusCircleOutlined title="新增主题元" className={props.className} onClick={() => setOpen(true)}></PlusCircleOutlined>
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
            <Button type='primary' htmlType='submit'>确定</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>

  )
}