import { CSSProperties, FC, useRef, useState } from "react"
import tinycolor from "tinycolor2"
import { ColorPicker, Input } from 'antd'
import { useCompWithMutation } from "../useCompWithMutation"
import { useCreation } from "ahooks"

type BaseStringValueProps = {
  /** 显示在input中的文字 默认为value */
  text?: string,
  /** 实际值 可以被解析为颜色 */
  value: string,
  onChange: (newValue: string) => void,
  style?: CSSProperties,
  className?: string,
  // 是否将value视作纯字符串
  pureString?: boolean
}

/** 
 * 用于展示和更改字符串和颜色  
 * 常规非受控组件 value突变时受控  
 * 根据初始value或突变value判断是否作为颜色展示  
 * 可以设置参数text以展示指定文字 不设置则展示value  
 * @example <BaseStringValue value={value} onChange={debounce(setValue, 1000)} />
*/
export const BaseStringValue: FC<BaseStringValueProps> = props => {
  const [key, onInnerChange] = useCompWithMutation(props.value, props.onChange, isEqual)
  return (
    <BaseStringValueInner key={key}
      defaultText={props.text} defaultValue={props.value} pureString={props.pureString}
      onChange={onInnerChange}
    />
  )
}

type BaseStringValueInnerProps = {
  /** 初始显示在input中的文字 */
  defaultText?: string,
  /** 初始实际的值 可以被解析为颜色 */
  defaultValue: string,
  onChange: (newValue: string) => void,
  style?: CSSProperties,
  className?: string,
  // 是否将value视作纯字符串
  pureString?: boolean
}

const BaseStringValueInner: FC<BaseStringValueInnerProps> = props => {
  const [text, setText] = useState(props.defaultText ?? props.defaultValue)
  const [color, setColor] = useState(props.defaultValue)
  const colorSpan = (
    <ColorPicker value={color} format='rgb'
      onChange={v => {
        const colorString = v.toRgbString()
        props.onChange?.(colorString)
        setText(colorString)
      }}
    />
  )

  const isColor = !props.pureString && tinycolor(color).isValid()

  return (
    <Input style={props.style} className={props.className}
      value={text} suffix={isColor ? colorSpan : null}
      onChange={e => {
        const newText = e.target.value
        props.onChange?.(newText)
        setText(newText)
        if (tinycolor(newText).isValid()) {
          setColor(newText)
        }
      }}
    />
  )
}

/** 判断可能为颜色的字符串是否相等 */
const isEqual = (val1?: string, val2?: string) => {
  if (val1 === val2) return true
  if (val1 === undefined || val2 === undefined) return false
  const color1 = tinycolor(val1)
  const color2 = tinycolor(val2)
  if (!color1.isValid() || !color2.isValid()) return false
  return tinycolor.equals(color1, color2)
}