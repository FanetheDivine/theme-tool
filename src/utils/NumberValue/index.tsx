import { InputNumber } from "antd"
import { FC } from "react"
import { useCompWithMutation } from "../useCompWithMutation"

type NumberValueProps = {
  value: number,
  onChange: (newVal: number) => void,
  className?:string
}

/** 仅在value突变时受控的组件 */
export const NumberValue: FC<NumberValueProps> = props => {
  const [key, onChange] = useCompWithMutation(props.value, props.onChange)
  return <InputNumber key={key} className={props.className} defaultValue={props.value} onChange={num => onChange(num ?? 0)}></InputNumber>
} 