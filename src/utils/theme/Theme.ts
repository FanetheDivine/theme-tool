/** 主题元 */
export type ThemeItem = {
  /** 主题元描述 */
  desc: string,
  /** 数字、字符串或颜色值 */
  value: number | string
}

/** 主题 */
export type Theme = Map<string, ThemeItem>

/** 是否是合法主题元名称 */
export function isLegalThemeItemName(name: string) {
  return /^@([a-z]+-)*[a-z]+$/.test(name)
}

/** 变更类型 */
export type ThemeEdit = { type: 'add', value: ThemeItem } | { type: 'delete' } | { type: 'change', value: ThemeItem['value'] }

/** 主题变更 */
export type ThemeEditRecorder = Map<string, ThemeEdit>

/** 创建或替换与`name`同名的主题元.这个函数会修改参数`themeEditRecorder`. */
export function addThemeItem(themeEditRecorder: ThemeEditRecorder, name: string, value: ThemeItem) {
  if (!isLegalThemeItemName(name)) {
    throw new Error(`'${name}'不是合法主题元名称`)
  }
  themeEditRecorder.set(name, { type: 'add', value })
}

/** 删除与`name`同名的主题元.这个函数会修改参数`themeEditRecorder`. */
export function deleteThemeItem(theme: Theme, themeEditRecorder: ThemeEditRecorder, name: string) {
  if (theme.has(name)) {
    themeEditRecorder.set(name, { type: 'delete' })
  } else {
    themeEditRecorder.delete(name)
  }
}

/** 修改与`name`同名的主题元.这个函数会修改参数`themeEditRecorder`. */
export function changeThemeItem(theme: Theme, themeEditRecorder: ThemeEditRecorder, name: string, value: ThemeItem['value']) {
  if (themeEditRecorder.has(name)) {
    const record = themeEditRecorder.get(name)!
    if (record.type === 'delete' || record.type === 'change') {
      themeEditRecorder.set(name, { type: 'change', value })
    } else if (record.type === 'add') {
      record.value.value = value
    }
  } else if (theme.has(name)) {
    themeEditRecorder.set(name, { type: 'change', value })
  }
}

/** 取得应用变更后的主题 */
export function getEditedTheme(theme: Theme, themeEditRecorder: ThemeEditRecorder): Theme {
  const editedTheme: Theme = new Map<string, ThemeItem>(theme.entries())
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