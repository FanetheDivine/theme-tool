import { DeleteOutlined } from "@ant-design/icons"
import { FC } from "react"

type DeleteThemeMapIconProps = {
    themeMapKey:string,
    className?:string
}

export const DeleteThemeMapIcon:FC<DeleteThemeMapIconProps> = props=>{
    throw new Error('删除映射按钮尚未完成')
    return <DeleteOutlined className={props.className} title='删除'></DeleteOutlined>
}