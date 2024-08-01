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
export type ThemeMapEdit = { type: 'add', value: SubThemeMap | PropertyMap }
  | { type: 'delete' }
  | { type: 'change', value: PropertyMapValue }
  | { type: 'descChange', desc: string }

/** 映射变更 */
export type ThemeMapEditRecorder = Map<string, ThemeMapEdit>

/********************  映射变更系列类型结束    ********************/



/** 判断是否是属性映射 */
export function isPropertyMap(value: SubThemeMap | PropertyMap): value is PropertyMap {
  return 'value' in value
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
function copyThemeMapEditRecorder(themeMapEditRecorder: ThemeMapEditRecorder): ThemeMapEditRecorder {
  const newThemeMapEditRecorder: ThemeMapEditRecorder = new Map(themeMapEditRecorder.entries())
  return newThemeMapEditRecorder
}

/** 创建或替换key指示的具有下级结构的子映射.创建一个新变更反映此次变更.  */
export function addThemeMap(themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, desc: string) {
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'add', value: { desc, children: new Map() as ThemeMap } })
  return newThemeMapEditRecorder
}

/** 创建或替换key指示的属性映射.创建一个新变更反映此次变更.  */
export function addThemeMapPropertyMap(themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, value: PropertyMap) {
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'add', value })
  return newThemeMapEditRecorder
}

/** 删除key指示的子映射.创建一个新变更反映此次变更. */
export function deleteThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string) {
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'delete' })
  } else {
    newThemeMapEditRecorder.delete(themeMapEditRecorderKey)
  }
  return newThemeMapEditRecorder
}

/** 修改key指示的属性映射.创建一个新变更反映此次变更. */
export function changeThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, value: PropertyMapValue) {
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  const record = newThemeMapEditRecorder.get(themeMapEditRecorderKey)
  if (record) {
    switch (record.type) {
      case 'delete':
      case 'change': {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
        break
      }
      case 'add': {
        if (isPropertyMap(record.value)) {
          newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
            type: 'add',
            value: { desc: record.value.desc, value }
          })
        }
        break
      }
      case 'descChange': {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
          type: 'add',
          value: { desc: record.desc, value }
        })
        break
      }
    }
  } else if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'change', value })
  }
  return newThemeMapEditRecorder
}

/** 修改key指示的子映射的描述.创建一个新变更反映此次变更. */
export function changeThemeMapDesc(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey: string, desc: string) {
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  const record = newThemeMapEditRecorder.get(themeMapEditRecorderKey)
  if (record) {
    switch (record.type) {
      case 'delete':
      case 'descChange': {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'descChange', desc })
        break
      }
      case 'add': {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
          type: 'add',
          value: { ...record.value, desc }
        })
        break
      }
      case 'change': {
        newThemeMapEditRecorder.set(themeMapEditRecorderKey, {
          type: 'add',
          value: { value: record.value, desc }
        })
        break
      }
    }
  } else if (themeMapHas(themeMap, themeMapEditRecorderKey)) {
    newThemeMapEditRecorder.set(themeMapEditRecorderKey, { type: 'descChange', desc })
  }
  return newThemeMapEditRecorder
}

/** 撤销key指示的子映射的变更.创建一个新变更反映此次变更. */
export function undoThemeMapChange(themeMapEditRecorder: ThemeMapEditRecorder, themeMapEditRecorderKey?: string) {
  if (themeMapEditRecorderKey === undefined) {
    return new Map() as ThemeMapEditRecorder
  }
  const newThemeMapEditRecorder = copyThemeMapEditRecorder(themeMapEditRecorder)
  newThemeMapEditRecorder.delete(themeMapEditRecorderKey)
  return newThemeMapEditRecorder
}

/** 取得应用变更后的映射 */
export function getEditedThemeMap(themeMap: ThemeMap, themeMapEditRecorder: ThemeMapEditRecorder): ThemeMap {
  const copy = (themeMap: ThemeMap) => {
    const newThemeMap: ThemeMap = new Map()
    Array.from(themeMap.entries()).forEach(([key, value]) => {
      if (isPropertyMap(value)) {
        newThemeMap.set(key, value)
      } else {
        newThemeMap.set(key, { desc: value.desc, children: copy(value.children) })
      }
    })
    return newThemeMap
  }
  const editedThemeMap = copy(themeMap)

  Array.from(themeMapEditRecorder.entries()).forEach(([themeMapEditRecorderKey, record]) => {
    const keys = themeMapEditRecorderKey.split('.')
    let currentThemeMap: ThemeMap = editedThemeMap
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      if (i === keys.length - 1) {
        switch (record.type) {
          case 'delete': {
            currentThemeMap.delete(key)
            break
          }
          case 'add': {
            currentThemeMap.set(key, record.value)
            break
          }
          case 'change': {
            const curValue = currentThemeMap.get(key)
            if (curValue) {
              currentThemeMap.set(key, { desc: curValue.desc, value: record.value })
            }
            break
          }
          case 'descChange': {
            if (currentThemeMap.has(key)) {
              const curValue = currentThemeMap.get(key)!
              currentThemeMap.set(key, { ...curValue, desc: record.desc })
            }
            break
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