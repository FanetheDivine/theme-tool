import { isOriginThemeItem } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { DeleteOutlined } from "@ant-design/icons"
import { Modal } from "antd"
import { FC } from "react"

type DeleteThemeItemIconProps = {
  /** 主题元名称 */
  name: string,
  className?: string
}

/** 主题元名称删除按钮 */
export const DeleteThemeItemIcon: FC<DeleteThemeItemIconProps> = props => {
  const { name } = props
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  return (
    <DeleteOutlined className={props.className} title='删除' onClick={() => {
      const deleteVar = () => edit.themeVar.delete(name)
      if (isOriginThemeItem(name, themeInfo.themeVar, themeInfo.themeVarEditRecorder)) {
        deleteVar()
      } else {
        Modal.confirm({
          title: '确定删除？',
          content: '这个主题元不在初始的主题变量中,它的删除是不可逆的。',
          onOk: deleteVar
        })
      }
    }}
    />
  )
}