import { enableMapSet, produce } from "immer"

enableMapSet()

/** 属性映射 */
export type PropertyMap = {
  /** 对主题变量的描述 */
  desc: string,
  /** 对应主题变量的值 主题元名称、颜色、数字或者他们的数组 */
  value: string | number | (string | number)[]
}

/** 具有下级结构的子映射 */
export type SubThemeMap = {
  /** 对当前层级主题变量的描述 */
  desc: string,
  /** 主题变量中的下级属性 */
  children: ThemeMap
}

/** 主题映射 */
export type ThemeMap = Map<string, PropertyMap | SubThemeMap>

/** 变更类型 */
export type ThemeMapEdit = { type: 'add', value: SubThemeMap | PropertyMap } | { type: 'delete' } | { type: 'change', value: SubThemeMap['children'] | PropertyMap['value'] }

/** 映射变更 */
export type ThemeMapEditRecorder = Map<string, ThemeMapEdit>

/** 判断是否是属性映射 */
export function isPropertyMap(value: SubThemeMap | PropertyMap): value is PropertyMap {
  return 'value' in value
}

/** 判断一个类型为'change'的变更是否是属性映射变更 */
export function isPropertyMapEdit(value: SubThemeMap['children'] | PropertyMap['value']): value is PropertyMap['value'] {
  return !(value instanceof Map)
}

/** 判断`key`所指示的子映射是否被映射包含 */
export function themeMapHas(themeMap: ThemeMap, themeMapEditRecorderKey: string): Boolean {
  const keys = themeMapEditRecorderKey.split('.')
  let currentThemeMap: ThemeMap = themeMap
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]
    if (i === keys.length - 1) {
      if (currentThemeMap.has(key)) {
        return true
      }
    } else if (currentThemeMap.has(key)) {
      const currentValue = currentThemeMap.get(key)!
      if (!isPropertyMap(currentValue)) {
        currentThemeMap = currentValue.children
      } else {
        break
      }
    } else {
      break
    }
  }
  return false
}

/** 创建或替换key指示的子映射.这个函数会修改参数`themeMapEditRecorder`.  */
export function addThemeMap(themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, value: SubThemeMap | PropertyMap) {
  themeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'add', value })
}

/** 删除key指示的子映射.这个函数会修改参数`themeMapEditRecorder`. */
export function deleteThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string) {
  if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    themeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'delete' })
  } else {
    themeMapEditRecorder.delete(themeMapEditRecorderKey)
  }
}

/** 修改key指示的子映射.这个函数会修改参数`themeMapEditRecorder`. */
export function changeThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, value: SubThemeMap['children'] | PropertyMap['value']) {
  if (themeMapEditRecorder.has(themeMapEditRecorderKey)) {
    const record = themeMapEditRecorder.get(themeMapEditRecorderKey)!
    if (record.type === 'delete' || record.type === 'change') {
      themeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
    } else if (record.type === 'add') { // 属性映射和子映射分别修改
      if (!isPropertyMap(record.value) && !isPropertyMapEdit(value)) {
        record.value.children = value
      } else if (isPropertyMap(record.value) && isPropertyMapEdit(value)) {
        record.value.value = value
      }
    }
  } else if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    themeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
  }
}

/** 取得应用变更后的映射 */
export function getEditedThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder): ThemeMap {
  const editedThemeMap = produce(themeMap, draft => {
    themeMapEditRecorder.entries().forEach(([themeMapEditRecorderKey, record]) => {
      const keys = themeMapEditRecorderKey.split('.')
      let currentThemeMap: ThemeMap = draft
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        if (i === keys.length - 1) {
          if (record.type === 'delete') {
            currentThemeMap.delete(key)
          } else if (record.type === 'add') {
            currentThemeMap.set(key, record.value)
          } else if (record.type === 'change') {
            if (currentThemeMap.has(key)) {
              const curValue = currentThemeMap.get(key)!
              if (isPropertyMapEdit(record.value)) {
                currentThemeMap.set(key, { desc: curValue.desc, value: record.value })
              } else {
                currentThemeMap.set(key, { desc: curValue.desc, children: record.value })
              }
            }
          }
        } else if (currentThemeMap.has(key)) {
          const curValue = currentThemeMap.get(key)!
          if (!isPropertyMap(curValue)) {
            currentThemeMap = curValue.children
          } else {
            break
          }
        } else {
          break
        }
      }
    })
  })
  return editedThemeMap
}