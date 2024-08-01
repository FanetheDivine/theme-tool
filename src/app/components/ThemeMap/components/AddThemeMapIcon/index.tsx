import { PlusCircleOutlined } from "@ant-design/icons"
import { FC } from "react"

type AddThemeMapIconProps = {
    themeMapKey:string,
    className?:string
}

export const AddThemeMapIcon:FC<AddThemeMapIconProps> = props=>{
    throw new Error('增加映射按钮尚未完成')
    return <PlusCircleOutlined title={'新增映射'} className={props.className}></PlusCircleOutlined>
}