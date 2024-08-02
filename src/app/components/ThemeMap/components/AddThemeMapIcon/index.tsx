import { getEditedThemeMap, getEditedThemeVar } from "@/lib/Theme"
import { getThemeMapByKey } from "@/lib/Theme/ThemeMap"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { PlusCircleOutlined } from "@ant-design/icons"
import { Button, Form, Input, Modal, Radio, Select } from "antd"
import { FC, useState } from "react"

type AddThemeMapIconProps = {
  superKey?: string,
  className?: string
}

export const AddThemeMapIcon: FC<AddThemeMapIconProps> = props => {
  type FormValue = { name: string, desc: string }
    & (
      { type: 'SubThemeMap' }
      | {
        type: 'PropertyMap'
        value: { type: 'number', numberValue: number }
        | { type: 'string', stringValue: string }
        | { type: 'color', colorValue: string }
        | { type: 'themeItem', themeItemValue: string }
      }
    )
  const { themeInfo, edit } = useTheme()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const type: FormValue['type'] = Form.useWatch('type', form) ?? 'SubThemeMap'
  const valueType = Form.useWatch(['value', 'type'], form) ?? 'color'
  const options = [
    { label: '颜色', value: 'color' },
    { label: '字符串', value: 'string' },
    { label: '数字', value: 'number' },
    { label: '主题元名称', value: 'themeItem' }
  ]
  if (!themeInfo) return null
  const getThemeMapKey = (name: string) => {
    return props.superKey ? `${props.superKey}.${name}` : name
  }
  const editedThemeMap = getEditedThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder)
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const submit = (formValue: FormValue) => {
    const themeMapKey = getThemeMapKey(formValue.name)
    if (formValue.type === 'SubThemeMap') {
      edit.themeMap.add(themeMapKey, formValue.desc)
    } else {
      const value = (() => {
        switch (formValue.value.type) {
          case 'color': {
            return formValue.value.colorValue
          }
          case 'string': {
            return formValue.value.stringValue
          }
          case 'number': {
            return formValue.value.numberValue
          }
          case 'themeItem': {
            return formValue.value.themeItemValue
          }
        }
      })()
      edit.themeMap.addPropertyMap(themeMapKey, { desc: formValue.desc, value })
    }
    setOpen(false)
  }

  return (
    <>
      <PlusCircleOutlined title={'新增映射'} onClick={() => setOpen(true)} className={props.className}></PlusCircleOutlined>
      <Modal classNames={{ wrapper: '-top-16' }} open={open} title={'新增映射'} maskClosable={false} footer={null} destroyOnClose onCancel={() => setOpen(false)}>
        <Form<FormValue> onFinish={submit} preserve={false} form={form} layout='vertical'>
          <Form.Item<FormValue> name={'name'} label='映射名' validateFirst
            rules={[
              { required: true, message: '请填写映射名' },
              {
                validator: async (_, name) => {
                  if (getThemeMapByKey(editedThemeMap, getThemeMapKey(name))) {
                    throw new Error('映射名称重复')
                  }
                }
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FormValue> name='desc' label='描述' rules={[{ required: true, message: '请填写描述' }]}>
            <Input />
          </Form.Item>
          <Form.Item<FormValue> name={'type'} label='映射类型' initialValue={'SubThemeMap'}>
            <Radio.Group>
              <Radio value={'SubThemeMap'}>具有下级结构的子映射</Radio>
              <Radio value={'PropertyMap'}>属性映射</Radio>
            </Radio.Group>
          </Form.Item>
          {
            type === 'PropertyMap'
              ? (
                <Form.Item<FormValue> name={['value', 'type']} initialValue={'color'}>
                  <Select options={options}></Select>
                </Form.Item>
              )
              : null
          }
          {
            type === 'PropertyMap'
              ? (() => {
                switch (valueType) {
                  case 'color': {
                    return (
                      <Form.Item<FormValue> name={['value', 'colorValue']} label='初始值' initialValue={'#4096fa'}>
                        <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                      </Form.Item>
                    )
                  }
                  case 'string': {
                    return (
                      <Form.Item<FormValue> name={['value', 'stringValue']} label='初始值' initialValue={''}>
                        <BaseStringValue value={''} onChange={() => { }}></BaseStringValue>
                      </Form.Item>
                    )
                  }
                  case 'number': {
                    return (
                      <Form.Item<FormValue> name={['value', 'numberValue']} label='初始值' initialValue={0}>
                        <NumberValue value={0} onChange={() => { }}></NumberValue>
                      </Form.Item>
                    )
                  }
                  case 'themeItem': {
                    const themeItemOptions = Array.from(editedThemeVar.keys()).map(name => ({ label: name, value: name }))
                    return (
                      <Form.Item<FormValue> name={['value', 'themeItemValue']} label='初始值' initialValue={themeItemOptions[0].value}>
                        <Select options={themeItemOptions}></Select>
                      </Form.Item>
                    )
                  }
                  default:
                    return null
                }
              }
              )()
              : null
          }
          <Form.Item>
            <Button type='primary' htmlType='submit'>确定</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>

  )
}