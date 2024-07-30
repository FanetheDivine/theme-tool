import { CSSProperties, FC, memo, useRef, useState } from "react"
import tinycolor from "tinycolor2"
import { ColorPicker, Input } from 'antd'
import { usePrevious } from "ahooks"

type BaseStringValueProps = {
  /** 显示在input中的文字 */
  text?: string,
  /** 实际的值 可以被解析为颜色 */
  value: string,
  onChange?: (newValue: string) => void,
  style?: CSSProperties,
  className?: string
}

/** 
 * 用于展示和更改字符串和颜色  
 * 常规非受控组件 value突变时受控  
 * 根据初始value或突变value判断是否作为颜色展示  
 * 可以设置参数text以展示指定文字 不设置则展示value  
 * @example <BaseStringValue value={value} onChange={debounce(setValue, 1000)} />
*/
export const BaseStringValue: FC<BaseStringValueProps> = props => {
  const changedValueRef = useRef<string | tinycolor.Instance>()
  const prevValue = usePrevious(props.value)
  const keyRef = useRef<string>()
  const curValue = tinycolor(props.value)
  if (prevValue !== props.value) {
    const equal = (typeof changedValueRef.current === 'string' && !curValue.isValid() && changedValueRef.current === props.value)
      || (typeof changedValueRef.current !== 'string' && curValue.isValid() && tinycolor.equals(changedValueRef.current, curValue))
    if (!equal) {
      keyRef.current = Date.now().toString()
    }
  }

  return (
    <BaseStringValueInner key={keyRef.current}
      style={props.style} className={props.className}
      defaultText={props.text ?? props.value} defaultValue={props.value}
      onChange={v => {
        const color = tinycolor(v)
        changedValueRef.current = color.isValid() ? color : v
        props.onChange?.(v)
      }}
    />
  )
}


type BaseStringValueInnerProps = {
  /** 初始显示在input中的文字 */
  defaultText: string,
  /** 初始实际的值 可以被解析为颜色 */
  defaultValue: string,
  onChange?: (newValue: string) => void,
  style?: CSSProperties,
  className?: string
}

const BaseStringValueInner: FC<BaseStringValueInnerProps> = props => {
  const [text, setText] = useState(props.defaultText)
  const defaultColorRef = useRef(props.defaultValue)
  const isColor = tinycolor(defaultColorRef.current).isValid()
  const colorSpan = (
    <ColorPicker defaultValue={props.defaultValue} format='rgb'
      onChange={v => {
        const colorString = v.toRgbString()
        props.onChange?.(colorString)
        setText(colorString)
      }}
    />
  )

  return (
    <Input style={props.style} className={props.className}
      value={text} suffix={isColor ? colorSpan : null}
      onChange={e => {
        const newText = e.target.value
        props.onChange?.(newText)
        setText(newText)
      }}
    />
  )
}