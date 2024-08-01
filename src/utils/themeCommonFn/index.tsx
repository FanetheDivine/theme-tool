import { ThemeVar, ThemeVarEditRecorder, PropertyMap, ThemeMapItemBaseType, ThemeMap, isPropertyMap, ThemeMapEditRecorder, Property, Theme, isProperty } from "@/lib/Theme";


/** 将主题变量转化为可序列化的对象 */

export function themeVarToObj<T>(themeVar: ThemeVar<T>) {
  return Array.from(themeVar)
}
/** 将变量变更转化为可序列化的对象 */

export function themeVarEditRecorderToObj<T>(themeVar: ThemeVarEditRecorder<T>) {
  return Array.from(themeVar)
}
type ThemeMapObj = [string, PropertyMap | (ThemeMapItemBaseType & { children: ThemeMapObj })][]
/** 将主题映射转化为可序列化的对象 */

export function themeMapToObj(themeMap: ThemeMap): ThemeMapObj {
  return Array.from(themeMap).map(([key, value]) => {
    if (isPropertyMap(value)) {
      return [key, value]
    } else {
      return [key, { desc: value.desc, children: themeMapToObj(value.children) }]
    }
  })
}
/** 将映射变更转化为可序列化的对象 */

export function themeMapEditRecorderToObj(themeMapEditRecorder: ThemeMapEditRecorder) {
  return Array.from(themeMapEditRecorder).map(([recorderKey, record]) => {
    if (record.type === 'add' && !isPropertyMap(record.value)) {
      return [recorderKey, { type: record.type, value: { desc: record.value.desc, children: themeMapToObj(record.value.children) } }]
    } else {
      return [recorderKey, record]
    }
  })
}
type ThemeObj<T> = [string, Property<T> | (ThemeMapItemBaseType & { children: ThemeObj<T> })][]
/** 将主题转化为可序列化的对象 */

export function themeToObj<T>(theme: Theme<T>): ThemeObj<T> {
  return Array.from(theme).map(([key, value]) => {
    if (isProperty(value)) {
      return [key, value]
    } else {
      return [key, { desc: value.desc, children: themeToObj(value.children) }]
    }
  })
}
