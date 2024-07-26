/********************  主题映射系列类型    ********************/

/** 属性映射值的基础类型 主题元名称、字符串、数字*/
export type PropertyMapBaseValue = string | number

/** 属性映射值类型 基础类型或它的嵌套数组 */
export type PropertyMapValue = PropertyMapBaseValue | PropertyMapValue[]

/** 主题变量的基础类型 */
export type ThemeMapItemBaseType = {
  /** 主题变量的描述 */
  desc: string
}

/** 属性映射 */
export type PropertyMap = ThemeMapItemBaseType & {
  /** 对应主题变量的值 */
  value: PropertyMapValue
}

/** 具有下级结构的子映射 */
export type SubThemeMap = ThemeMapItemBaseType & {
  /** 对应主题变量的子属性 */
  children: ThemeMap
}

/** 主题映射 */
export type ThemeMap = Map<string, PropertyMap | SubThemeMap>

/********************  主题映射系列类型结束    ********************/



/********************  映射变更系列类型    ********************/

/** 变更类型 */
export type ThemeMapEdit = { type: 'add', value: SubThemeMap | PropertyMap } | { type: 'delete' } | { type: 'change', value: ThemeMap | PropertyMapValue }

/** 映射变更 */
export type ThemeMapEditRecorder = Map<string, ThemeMapEdit>

/********************  映射变更系列类型结束    ********************/



/** 判断是否是属性映射 */
export function isPropertyMap(value: SubThemeMap | PropertyMap): value is PropertyMap {
  return 'value' in value
}

/** 判断一个类型为'change'的变更是否是属性映射变更 */
export function isPropertyMapEdit(value: ThemeMap | PropertyMapValue): value is PropertyMapValue {
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

/** 创建当前变更的浅复制 */
function copyThemeEditRecorder(themeMapEditRecorder: ThemeMapEditRecorder | undefined): ThemeMapEditRecorder {
  const newThemeMapEditRecorder: ThemeMapEditRecorder = themeMapEditRecorder ? new Map(themeMapEditRecorder.entries()) : new Map()
  return newThemeMapEditRecorder
}

/** 创建或替换key指示的子映射.创建一个新变更反映此次变更.  */
export function addThemeMap(themeMapEditRecorder: ThemeMapEditRecorder | undefined, themeMapEditRecorderKey: string, value: SubThemeMap | PropertyMap) {
  const newThemeMapEditRecorder = copyThemeEditRecorder(themeMapEditRecorder)
  newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'add', value })
  return newThemeMapEditRecorder
}

/** 删除key指示的子映射.创建一个新变更反映此次变更. */
export function deleteThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder | undefined, themeMapEditRecorderKey: string) {
  const newThemeMapEditRecorder = copyThemeEditRecorder(themeMapEditRecorder)
  if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'delete' })
  } else {
    newThemeMapEditRecorder.delete(themeMapEditRecorderKey)
  }
  return newThemeMapEditRecorder
}

/** 修改key指示的子映射.创建一个新变更反映此次变更. */
export function changeThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder | undefined, themeMapEditRecorderKey: string, value: ThemeMap | PropertyMapValue) {
  const newThemeMapEditRecorder = copyThemeEditRecorder(themeMapEditRecorder)
  if (newThemeMapEditRecorder.has(themeMapEditRecorderKey)) {
    const record = newThemeMapEditRecorder.get(themeMapEditRecorderKey)!
    if (record.type === 'delete' || record.type === 'change') {
      newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
    } else if (record.type === 'add') {
      if (!isPropertyMap(record.value) && !isPropertyMapEdit(value)) {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
          ...record,
          value: { ...record.value, children: value }
        })
      } else if (isPropertyMap(record.value) && isPropertyMapEdit(value)) {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
          ...record,
          value: { ...record.value, value }
        })
      }
    }
  } else if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
  }
  return newThemeMapEditRecorder
}

/** 取得应用变更后的映射 */
export function getEditedThemeMap(themeMap: ThemeMap, themeMapEditRecorder?: ThemeMapEditRecorder): ThemeMap {
  if(!themeMapEditRecorder){
    return themeMap
  }
  const copy = (themeMap: ThemeMap) => {
    const newThemeMap: ThemeMap = new Map()
    themeMap.entries().forEach(([key, value]) => {
      if (isPropertyMap(value)) {
        newThemeMap.set(key, value)
      } else {
        newThemeMap.set(key, { desc: value.desc, children: copy(value.children) })
      }
    })
    return newThemeMap
  }
  const editedThemeMap = copy(themeMap)

  themeMapEditRecorder.entries().forEach(([themeMapEditRecorderKey, record]) => {
    const keys = themeMapEditRecorderKey.split('.')
    let currentThemeMap: ThemeMap = themeMap
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

  return editedThemeMap
}