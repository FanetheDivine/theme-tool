import { UndoOutlined } from "@ant-design/icons"
import classNames from "classnames"
import { FC } from "react"

type UndoThemeMapIconProps = {
    themeMapKey:string,
    className?:string
}

export const UndoThemeMapIcon:FC<UndoThemeMapIconProps> = props=>{
    throw new Error('撤销映射变更按钮尚未完成')
    return <UndoOutlined title='撤销变更' className={classNames('text-sm',props.className)}></UndoOutlined>
}