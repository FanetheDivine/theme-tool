import { isOriginThemeMap } from "@/lib/Theme"
import { useTheme } from "@/utils/theme"
import { DeleteOutlined } from "@ant-design/icons"
import { Modal } from "antd"
import { FC } from "react"

type DeleteThemeMapIconProps = {
  themeMapKey: string,
  className?: string
}

export const DeleteThemeMapIcon: FC<DeleteThemeMapIconProps> = props => {
  const { themeInfo, edit } = useTheme()
  if (!themeInfo) return null
  return (
    <DeleteOutlined className={props.className} title='删除'
      onClick={() => {
        const deleteThemeMap = () => edit.themeMap.delete(props.themeMapKey)
        if (!isOriginThemeMap(props.themeMapKey, themeInfo.themeMap, themeInfo.themeMapEditRecorder)) {
          Modal.confirm({
            title: '确认删除?',
            content: '这个操作会删除此映射及它的所有下级映射.这个映射不在初始的主题映射中,它的删除是不可逆的.',
            onOk: deleteThemeMap
          })
        } else {
          deleteThemeMap()
        }
      }}
    />
  )
}