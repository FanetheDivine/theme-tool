import { CSSProperties, FC, memo, useRef, useState } from "react"
import tinycolor from "tinycolor2"
import { ColorPicker, Input } from 'antd'
import { usePrevious } from "ahooks"

type BaseStringValueProps = {
  /** 显示在input中的文字 */
  text: string,
  /** 实际的值 可以被解析为颜色 */
  value: string,
  onChange?: (newValue: string) => void,
  style?: CSSProperties,
  className?: string
}

/** 展示字符串和颜色的组件 在value突变时会重置值 */
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
      defaultText={props.text} defaultValue={props.value}
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