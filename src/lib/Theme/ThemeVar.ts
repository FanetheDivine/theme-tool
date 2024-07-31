/********************  主题变量系列类型    ********************/

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

/** 主题变量 */
export type ThemeVar<T> = Map<string, ThemeItem<T>>

/********************  主题变量系列类型结束    ********************/



/********************  主题变量变更系列类型    ********************/

/** 变更类型 */
export type ThemeVarEdit<T> = { type: 'add', value: ThemeItem<T> }
  | { type: 'delete' }
  | { type: 'change', value: ThemeItemValue<T> }
  | { type: 'descChange', desc: string }

/** 主题变量变更 */
export type ThemeVarEditRecorder<T> = Map<string, ThemeVarEdit<T>>

/********************  主题变量变更系列类型结束    ********************/



/** 是否是合法主题元名称 */
export function checkThemeItemName(name: string): void | never {
  if (!/^@([a-z]+-)*[a-z]+$/.test(name)) {
    throw new Error(`'${name}'不是合法主题元名称`)
  }
}

/** 创建当前变更的浅复制 */
function copyThemeVarEditRecorder<T>(themeVarEditRecorder: ThemeVarEditRecorder<T>): ThemeVarEditRecorder<T> {
  const newThemeVarEditRecorder: ThemeVarEditRecorder<T> = new Map(themeVarEditRecorder.entries())
  return newThemeVarEditRecorder
}

/** 创建或替换与`name`同名的主题元.创建一个新变更反映此次变更. */
export function addThemeItem<T>(themeVarEditRecorder: ThemeVarEditRecorder<T>, name: string, value: ThemeItem<T>) {
  checkThemeItemName(name)
  const newThemeVarEditRecorder = copyThemeVarEditRecorder(themeVarEditRecorder)
  newThemeVarEditRecorder.set(name, { type: 'add', value })
  return newThemeVarEditRecorder
}

/** 删除与`name`同名的主题元.创建一个新变更反映此次变更. */
export function deleteThemeItem<T>(themeVar: ThemeVar<T>, themeVarEditRecorder: ThemeVarEditRecorder<T>, name: string) {
  const newThemeVarEditRecorder = copyThemeVarEditRecorder(themeVarEditRecorder)
  if (themeVar.has(name)) {
    newThemeVarEditRecorder.set(name, { type: 'delete' })
  } else {
    newThemeVarEditRecorder.delete(name)
  }
  return newThemeVarEditRecorder
}

/** 修改与`name`同名的主题元.创建一个新变更反映此次变更. */
export function changeThemeItem<T>(themeVar: ThemeVar<T>, themeVarEditRecorder: ThemeVarEditRecorder<T>, name: string, value: ThemeItemValue<T>) {
  const newThemeVarEditRecorder = copyThemeVarEditRecorder(themeVarEditRecorder)
  const record = newThemeVarEditRecorder.get(name)
  if (record) {
    switch (record.type) {
      case 'delete':
      case 'change': {
        newThemeVarEditRecorder.set(name, { type: 'change', value })
        break
      }
      case 'add': {
        newThemeVarEditRecorder.set(name, {
          type: 'add',
          value: { desc: record.value.desc, value }
        })
        break
      }
      case 'descChange': {
        newThemeVarEditRecorder.set(name, {
          type: 'add',
          value: { desc: record.desc, value }
        })
        break
      }
    }
  } else if (themeVar.has(name)) {
    newThemeVarEditRecorder.set(name, { type: 'change', value })
  }
  return newThemeVarEditRecorder
}

/** 修改与`name`同名的主题元的描述.创建一个新变更反映此次变更. */
export function changeThemeItemDesc<T>(theme: ThemeVar<T>, themeVarEditRecorder: ThemeVarEditRecorder<T>, name: string, desc: string) {
  const newThemeVarEditRecorder = copyThemeVarEditRecorder(themeVarEditRecorder)
  const record = newThemeVarEditRecorder.get(name)
  if (record) {
    switch (record.type) {
      case 'delete':
      case 'descChange': {
        newThemeVarEditRecorder.set(name, { type: 'descChange', desc })
        break
      }
      case 'add': {
        newThemeVarEditRecorder.set(name, {
          type: 'add',
          value: { value: record.value.value, desc }
        })
        break
      }
      case 'change': {
        newThemeVarEditRecorder.set(name, {
          type: 'add',
          value: { value: record.value, desc: desc }
        })
        break
      }
    }
  } else if (theme.has(name)) {
    newThemeVarEditRecorder.set(name, { type: 'descChange', desc })
  }
  return newThemeVarEditRecorder
}

/** 撤销key指示的子映射的变更.创建一个新变更反映此次变更. */
export function undoThemeVarChange<T>(themeVarEditRecorder: ThemeVarEditRecorder<T>, name?: string) {
  if (name === undefined) {
    return new Map() as ThemeVarEditRecorder<T>
  }
  const newThemeVarEditRecorder = copyThemeVarEditRecorder(themeVarEditRecorder)
  newThemeVarEditRecorder.delete(name)
  return newThemeVarEditRecorder
}

/** 取得应用变更后的主题变量 */
export function getEditedThemeVar<T>(theme: ThemeVar<T>, themeVarEditRecorder: ThemeVarEditRecorder<T>): ThemeVar<T> {
  const editedTheme: ThemeVar<T> = new Map(theme.entries())
  themeVarEditRecorder.entries().forEach(([name, record]) => {
    switch (record.type) {
      case 'delete': {
        editedTheme.delete(name)
        break
      }
      case 'add': {
        editedTheme.set(name, record.value)
        break
      }
      case 'change': {
        const curValue = editedTheme.get(name)
        if (curValue) {
          editedTheme.set(name, { desc: curValue.desc, value: record.value })
        }
        break
      }
      case 'descChange': {
        const curValue = editedTheme.get(name)
        if (curValue) {
          editedTheme.set(name, { value: curValue.value, desc: record.desc })
        }
        break
      }
    }
  })

  return editedTheme
}

/** 从拓展主题元名称中获取信息 
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

/** 是否是被删除的主题元 */
export function isDeletedThemeItem<T>(name: string, themeVarEditRecorder: ThemeVarEditRecorder<T>) {
  const editType = themeVarEditRecorder.get(name)?.type
  return editType === 'delete'
}

/** 是否是被编辑的主题元 */
export function isEditedThemeItem<T>(name: string, themeVarEditRecorder: ThemeVarEditRecorder<T>) {
  const editType = themeVarEditRecorder.get(name)?.type
  return editType === 'change' || editType === 'descChange'
}

/** 是否是主题变量中初始具有的主题元 */
export function isOriginThemeItem<T>(name: string, themeVar: ThemeVar<T>, themeVarEditRecorder: ThemeVarEditRecorder<T>) {
  return themeVar.has(name) && themeVarEditRecorder.get(name)?.type !== 'add'
}