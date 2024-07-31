import { useCallback, useRef } from "react"

/**
 * 使非受控组件的在value突变时重建,达到类似受控的效果
 * @param value 监听突变的值
 * @param onChange 变更函数
 * @param isEqual 比较函数.默认Object.is
 * @example 
 * const InputWithMutation:FC<{value:string,onChange:(newVal:string)=>void}> = props=>{
 *   const [key,onInnerChange] = useCompWithMutation(props.value,props.onChange)
 *   return <input key={key} defaultValue={props.value} onChange={e => onInnerChange(e.target.value)} />
 * }
 * 
 * const Comp:FC=()=>{
 *  const [text,setText] = useState('')
 *  return (
 *    <>
 *      <button onClick={()=>setText('reset')}>reset</button>
 *      <InputWithMutation value={text} onChange={setText}/>
 *    </>
 *  )
 * }
 */
export function useCompWithMutation<T>(value: T, onChange: (newVal: T) => void, isEqual?: (val1?: T, val2?: T) => boolean) {
  const keyRef = useRef<string>()
  const prevValueRef = useRef(value)
  const changedValueRef = useRef<T>()
  const onInnerChange = useCallback((newVal: T) => {
    changedValueRef.current = newVal
    onChange(newVal)
  }, [onChange])
  const equalFn = isEqual ?? Object.is.bind(Object)
  if (!equalFn(prevValueRef.current, value) || !equalFn(value, changedValueRef.current)) {
    keyRef.current = Date.now().toString()
  }
  prevValueRef.current = value
  return [keyRef.current, onInnerChange] as const
}