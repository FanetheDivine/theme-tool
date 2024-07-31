'use client'

import { ThemeItemValue } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { RightOutlined } from "@ant-design/icons"
import { Divider, Popover } from "antd"
import { Fragment } from "react"

type ThemeItemValueRenderProps<T> = {
  value: ThemeItemValue<T>,
  onChange: (newVal: ThemeItemValue<T>) => void
}

/** 展示主题元值 */
export function ThemeItemValueRender<T>(props: ThemeItemValueRenderProps<T>) {
  const { value } = props
  if (Array.isArray(value)) {
    const content = (
      <div className='flex flex-col'>
        <Divider className="my-1"></Divider>
        {
          value.map((v, index) => {
            return (
              <Fragment key={index}>
                <ThemeItemValueRender value={v} onChange={newVal => props.onChange(value.map((v, i) => i !== index ? v : newVal))}></ThemeItemValueRender>
                <Divider className='my-1'></Divider>
              </Fragment>
            )
          })
        }
      </div>
    )
    return (
      <Popover trigger={'click'} content={content} placement='right'>
        <div className='flex justify-around items-center cursor-pointer'>
          <span className='text-xl'>[...]</span>
          <RightOutlined className='text-xs'></RightOutlined>
        </div>
      </Popover>
    )
  } else if (typeof value === 'number') {
    return (
      <NumberValue value={value} onChange={props.onChange}></NumberValue>
    )
  } else if (typeof value === 'string') {
    return (
      <BaseStringValue value={value} onChange={props.onChange}></BaseStringValue>
    )
  } else {
    return null
  }
}