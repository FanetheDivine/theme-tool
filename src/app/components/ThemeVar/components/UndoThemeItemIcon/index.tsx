import { useTheme } from "@/utils/theme"
import { UndoOutlined } from "@ant-design/icons"
import classNames from "classnames"
import { FC } from "react"

type UndoThemeItemIcon = {
    name: string,
    className?:string
}

export const UndoThemeItemIcon: FC<UndoThemeItemIcon> = props => {
    const { themeInfo, edit } = useTheme()
    if (!themeInfo) return null
    return <UndoOutlined title='撤销变更' className={classNames('text-sm',props.className)} onClick={() => edit.themeVar.undo(props.name)}></UndoOutlined>
}