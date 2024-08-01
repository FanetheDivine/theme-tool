'use client'

import { getColor, getEditedThemeMap, getEditedThemeVar, getInfoFromExtendThemeItemName, isPropertyMap, PropertyMapValue, ThemeMap } from "@/lib/Theme"
import { BaseStringValue } from "@/utils/BaseStringValue"
import { NumberValue } from "@/utils/NumberValue"
import { useTheme } from "@/utils/theme"
import { InfoCircleOutlined, LeftOutlined } from "@ant-design/icons"
import { Divider, Popover, Tooltip, Typography } from "antd"
import classNames from "classnames"
import { FC, Fragment } from "react"
import tinycolor from "tinycolor2"
import { UndoThemeMapIcon } from "../UndoThemeMapIcon"
import { DeleteThemeMapIcon } from "../DeleteThemeMapIcon"
import { isEditedThemeMap, isOriginThemeMap } from "@/lib/Theme/ThemeMap"

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
                    ? <PropertyMapValueRender value={value.value} onChange={v => edit.themeMap.changeValue(themeMapKey, v)} />
                    : (
                      <Popover trigger={'click'} placement='left'
                        content={<ThemeMapRenderInner themeMap={value.children} superKey={themeMapKey}></ThemeMapRenderInner>}
                      >
                        <div className='flex items-center cursor-pointer text-sm'>
                          <LeftOutlined />
                          <span className='flex-auto text-center'>查看属性</span>
                        </div>
                      </Popover>
                    )
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
  text?: string
  value: PropertyMapValue,
  onChange: (newVal: PropertyMapValue) => void,
}

/** 展示属性映射值 */
const PropertyMapValueRender: FC<PropertyMapValueRenderProps> = props => {
  const { themeInfo } = useTheme()
  if (!themeInfo) return null
  const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
  const { value, onChange } = props
  if (typeof value === 'number') {
    return (
      <>
        {props.text}
        <NumberValue className='block' value={value} onChange={onChange}></NumberValue>
      </>
    )
  } else if (Array.isArray(value)) {
    const content = (
      <div className='flex flex-col'>
        <Divider className="my-1"></Divider>
        {
          value.map((v, index) => {
            return (
              <Fragment key={index}>
                <PropertyMapValueRender value={v} onChange={newVal => onChange(value.with(index, newVal))}></PropertyMapValueRender>
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
          <span className='flex-auto text-center'>{props.text ? `${props.text}(数组)` : '数组[...]'}</span>
        </div>
      </Popover>
    )
  } else if (typeof value === 'string') {
    const info = getInfoFromExtendThemeItemName(value)
    const commonString = (
      <>
        {props.text}
        <BaseStringValue value={value} onChange={onChange}></BaseStringValue>
      </>
    )
    if (!info || !editedThemeVar.has(info.themeItemName)) {
      // 不是主题变量中的合法主题元名称或其拓展 视作普通字符串
      return commonString
    }
    const themeItemValue = editedThemeVar.get(info.themeItemName)!.value
    if (typeof themeItemValue === 'string') {
      if (tinycolor(themeItemValue).isValid()) {
        const derivedColor = getColor(themeItemValue, info.level, info.opacity)
        return (
          <>
            {value}
            <BaseStringValue value={derivedColor} onChange={onChange}></BaseStringValue>
          </>
        )
      } else {
        if (info.level || info.opacity) {
          // 如果指定了色阶或透明度 但对应的值不是颜色 视作普通字符串
          return commonString
        } else {
          return (
            <>
              {value}
              <BaseStringValue value={themeItemValue} onChange={onChange}></BaseStringValue>
            </>
          )
        }
      }
    } else {
      return <PropertyMapValueRender value={themeItemValue} text={value} onChange={onChange} />
    }
  }
}

/** 展示映射名称 */
const ThemeMapName: FC<{ name: string, themeMapkey: string }> = props => {
  const { themeInfo } = useTheme()
  if (!themeInfo) return null
  return (
    <Typography.Title className='flex gap-2 items-end my-0' level={5}>
      <span className='text-xl'>{props.name}</span>
      {/* {
        !isOriginThemeMap(props.themeMapkey, themeInfo.themeVar, themeInfo.themeVarEditRecorder)
          ? (
            <Tooltip title={'这个映射不在初始的主题映射中'}>
              <InfoCircleOutlined className='text-xs'></InfoCircleOutlined>
            </Tooltip>
          )
          : null
      }
      <DeleteThemeMapIcon className='text-sm' themeMapKey={props.themeMapkey} />
      {
        isEditedThemeMap(props.themeMapkey, themeInfo.themeVarEditRecorder)
          ? <UndoThemeMapIcon themeMapKey={props.themeMapkey}/>
          : null
      } */}
    </Typography.Title>
  )
}

/** 展示映射描述 */
const ThemeMapDesc: FC<{ desc: string, themeMapkey: string }> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  return (
    <Typography.Text editable={{
      triggerType: ['icon'],
      onChange: newVal => edit.themeMap.changeDesc(props.themeMapkey, newVal)
    }}>
      {props.desc}
    </Typography.Text>
  )
}