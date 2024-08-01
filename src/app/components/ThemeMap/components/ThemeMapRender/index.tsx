'use client'

import { getEditedThemeMap, isPropertyMap, PropertyMapValue, ThemeMap } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { LeftOutlined } from "@ant-design/icons"
import { Divider, Popover, Typography } from "antd"
import classNames from "classnames"
import { FC, Fragment } from "react"

type ThemeMapRenderProps = {
  className?: string
}

/** 展示ThemeMap */
export const ThemeMapRender: FC<ThemeMapRenderProps> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  const editedThemeMap = getEditedThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder)
  return <ThemeMapRenderInner themeMap={editedThemeMap} className={props.className}></ThemeMapRenderInner>
}

type ThemeMapRenderInnerProps = {
  className?: string,
  themeMap: ThemeMap,
  /** 表示上级ThemeMap的映射索引 不传表示顶级映射 */
  superKey?: string
}

/** 递归渲染ThemeMap */
const ThemeMapRenderInner: FC<ThemeMapRenderInnerProps> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  return (
    <div className={classNames(props.className, 'flex flex-col overflow-auto')}>
      {
        Array.from(props.themeMap).map(([name, value]) => {
          const themeMapKey = props.superKey ? `${props.superKey}.${name}` : name
          return (
            <Fragment key={name}>
              <div className='flex flex-col'>
                <ThemeMapName name={name} themeMapkey={themeMapKey}></ThemeMapName>
                <ThemeMapDesc desc={value.desc} themeMapkey={themeMapKey}></ThemeMapDesc>
                <Divider className='my-2'></Divider>
                {
                  isPropertyMap(value)
                    ? <PropertyMapValueRender value={value.value} onChange={v => edit.themeMap.change(themeMapKey, v)} />
                    : <ThemeMapRenderInner themeMap={value.children} superKey={themeMapKey}></ThemeMapRenderInner>
                }
              </div>
              <Divider className='my-2'></Divider>
            </Fragment>
          )
        })
      }
    </div>
  )
}

type PropertyMapValueRenderProps = {
  value: PropertyMapValue,
  onChange: (newVal: PropertyMapValue) => void
}

/** 展示属性映射值 */
const PropertyMapValueRender: FC<PropertyMapValueRenderProps> = props => {
  const { value, onChange } = props
  if (typeof value === 'number') {
    return (
      <NumberValue value={value} onChange={onChange}></NumberValue>
    )
  } else if (typeof value === 'string') {
    return (
      /** string可能指示合法主题元 */
      <BaseStringValue value={value} onChange={onChange}></BaseStringValue>
    )
  } if (Array.isArray(value)) {
    const content = (
      <div className='flex flex-col'>
        <Divider className="my-1"></Divider>
        {
          value.map((v, index) => {
            return (
              <Fragment key={index}>
                <PropertyMapValueRender value={v} onChange={newVal => onChange(value.map((v, i) => i !== index ? v : newVal))}></PropertyMapValueRender>
                <Divider className='my-1'></Divider>
              </Fragment>
            )
          })
        }
      </div>
    )
    return (
      <Popover trigger={'click'} content={content} placement='left'>
        <div className='flex items-center cursor-pointer text-sm'>
          <LeftOutlined></LeftOutlined>
          <span className='flex-auto text-center'>数组[...]</span>
        </div>
      </Popover>
    )
  }
}

/** 展示映射名称 */
const ThemeMapName: FC<{ name: string, themeMapkey: string }> = props => {
  // 需要补充撤回按钮
  return <Typography.Title level={5}>{props.name}</Typography.Title>
}

/** 展示映射描述 */
const ThemeMapDesc: FC<{ desc: string, themeMapkey: string }> = props => {
  // 简介需要可以变更
  return (
    <Typography.Text editable={{}}>
      {props.desc}
    </Typography.Text>
  )
}