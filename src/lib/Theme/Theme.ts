/********************  主题系列类型    ********************/

/** 主题元值基础类型 数字、字符串(可被识别为颜色) */
export type ThemeItemBaseValue<T> = number | string | T

/** 主题元值类型 基础类型或它的嵌套数组 */
export type ThemeItemValue<T> = ThemeItemBaseValue<T> | ThemeItemValue<T>[]

/** 主题元 */
export type ThemeItem<T> = {
  /** 主题元描述 */
  desc: string,
  /** 主题元值 */
  value: ThemeItemValue<T>
}

/** 主题 */
export type Theme<T> = Map<string, ThemeItem<T>>

/********************  主题系列类型结束    ********************/



/********************  主题变更系列类型    ********************/

/** 变更类型 */
export type ThemeEdit<T> = { type: 'add', value: ThemeItem<T> }
  | { type: 'delete' }
  | { type: 'change', value: ThemeItemValue<T> }
  | { type: 'descChange', desc: string }

/** 主题变更 */
export type ThemeEditRecorder<T> = Map<string, ThemeEdit<T>>

/********************  主题变更系列类型结束    ********************/



/** 是否是合法主题元名称 */
export function checkThemeItemName(name: string): void | never {
  if (!/^@([a-z]+-)*[a-z]+$/.test(name)) {
    throw new Error(`'${name}'不是合法主题元名称`)
  }
}

/** 创建当前变更的浅复制 */
function copyThemeEditRecorder<T>(themeEditRecorder: ThemeEditRecorder<T> | undefined): ThemeEditRecorder<T> {
  const newThemeEditRecorder: ThemeEditRecorder<T> = themeEditRecorder ? new Map(themeEditRecorder.entries()) : new Map()
  return newThemeEditRecorder
}

/** 创建或替换与`name`同名的主题元.创建一个新变更反映此次变更. */
export function addThemeItem<T>(themeEditRecorder: ThemeEditRecorder<T> | undefined, name: string, value: ThemeItem<T>) {
  checkThemeItemName(name)
  const newThemeEditRecorder = copyThemeEditRecorder(themeEditRecorder)
  newThemeEditRecorder.set(name, { type: 'add', value })
  return newThemeEditRecorder
}

/** 删除与`name`同名的主题元.创建一个新变更反映此次变更. */
export function deleteThemeItem<T>(theme: Theme<T>, themeEditRecorder: ThemeEditRecorder<T> | undefined, name: string) {
  const newThemeEditRecorder = copyThemeEditRecorder(themeEditRecorder)
  if (theme.has(name)) {
    newThemeEditRecorder.set(name, { type: 'delete' })
  } else {
    newThemeEditRecorder.delete(name)
  }
  return newThemeEditRecorder
}

/** 修改与`name`同名的主题元.创建一个新变更反映此次变更. */
export function changeThemeItem<T>(theme: Theme<T>, themeEditRecorder: ThemeEditRecorder<T> | undefined, name: string, value: ThemeItemValue<T>) {
  const newThemeEditRecorder = copyThemeEditRecorder(themeEditRecorder)
  if (newThemeEditRecorder.has(name)) {
    const record = newThemeEditRecorder.get(name)!
    if (record.type === 'delete' || record.type === 'change') {
      newThemeEditRecorder.set(name, { type: 'change', value })
    } else if (record.type === 'add') {
      newThemeEditRecorder.set(name, {
        type: 'add',
        value: { desc: record.value.desc, value }
      })
    } else if (record.type === 'descChange') {
      newThemeEditRecorder.set(name, {
        type: 'add',
        value: { desc: record.desc, value }
      })
    }
  } else if (theme.has(name)) {
    newThemeEditRecorder.set(name, { type: 'change', value })
  }
  return newThemeEditRecorder
}

/** 修改与`name`同名的主题元的描述.创建一个新变更反映此次变更. */
export function changeThemeItemDesc<T>(theme: Theme<T>, themeEditRecorder: ThemeEditRecorder<T> | undefined, name: string, desc: string) {
  const newThemeEditRecorder = copyThemeEditRecorder(themeEditRecorder)
  if (newThemeEditRecorder.has(name)) {
    const record = newThemeEditRecorder.get(name)!
    if (record.type === 'delete' || record.type === 'descChange') {
      newThemeEditRecorder.set(name, { type: 'descChange', desc })
    } else if (record.type === 'add') {
      newThemeEditRecorder.set(name, {
        type: 'add',
        value: { value: record.value.value, desc }
      })
    } else if (record.type === 'change') {
      newThemeEditRecorder.set(name, {
        type: 'add',
        value: { value: record.value, desc: desc }
      })
    }
  } else if (theme.has(name)) {
    newThemeEditRecorder.set(name, { type: 'descChange', desc })
  }
  return newThemeEditRecorder
}

/** 取得应用变更后的主题 */
export function getEditedTheme<T>(theme: Theme<T>, themeEditRecorder?: ThemeEditRecorder<T>): Theme<T> {
  if (!themeEditRecorder) {
    return theme
  }
  const editedTheme: Theme<T> = new Map(theme.entries())
  themeEditRecorder.entries().forEach(([name, record]) => {
    if (record.type === 'delete') {
      editedTheme.delete(name)
    } else if (record.type === 'add') {
      editedTheme.set(name, record.value)
    } else if (record.type === 'change') {
      if (editedTheme.has(name)) {
        editedTheme.get(name)!.value = record.value
      }
    }
  })

  return editedTheme
}

/** 从拓展主题名中获取信息 
 * @returns 返回null表明是普通字符串,否则返回信息
*/
export function getInfoFromExtendThemeItemName(name: string) {
  const res = name.match(/^(@([a-z]+-)*[a-z]+)(-G([0-9]))?(-A([0-9]{1,3}))?$/)
  if (!res) {
    return null
  }
  const themeItemName = res[1]
  const level = Number(res[4] ?? 5)
  const opacity = Number(res[6] ?? 100)
  return {
    /** 合法主题元名称 */
    themeItemName,
    /** 在色阶中的索引 */
    level,
    /** 透明度(0-100) */
    opacity,
  }
}