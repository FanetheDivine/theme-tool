import { createContext, createElement, FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { type ThemeItem, type Theme, type ThemeEditRecorder, addThemeItem, deleteThemeItem, changeThemeItem, getInfoFromExtendThemeItemName, ThemeItemValue, checkThemeItemName, changeThemeItemDesc } from './Theme'
import { addThemeMap, changeThemeMap, changeThemeMapDesc, deleteThemeMap, isPropertyMap, PropertyMapValue, SubThemeMap, ThemeMapItemBaseType, type PropertyMap, type ThemeMap, type ThemeMapEditRecorder } from './ThemeMap'
import { generate } from '@ant-design/colors';
import TinyColor2 from 'tinycolor2'

export type { ThemeItemBaseValue, ThemeItemValue, ThemeItem, Theme, ThemeEdit, ThemeEditRecorder } from './Theme'
export type { PropertyMapBaseValue, PropertyMapValue, ThemeMapItemBaseType, PropertyMap, SubThemeMap, ThemeMap, ThemeMapEdit, ThemeMapEditRecorder } from './ThemeMap'
export { getEditedTheme, checkThemeItemName, getInfoFromExtendThemeItemName } from './Theme'
export { getEditedThemeMap, isPropertyMap, isPropertyMapEdit } from './ThemeMap'

/** 主题信息 */
export type ThemeInfo<T> = {
  theme: Theme<T>,
  themeMap: ThemeMap,
  themeEditRecorder?: ThemeEditRecorder<T>,
  themeMapEditRecorder?: ThemeMapEditRecorder
}

/** 获取主题上下文和钩子 */
export function createTheme<T = never>(initTheme?: ThemeInfo<T>) {

  const ThemeContext = createContext<ReturnType<typeof useState<ThemeInfo<T>>> | null>(null)

  const ThemeProvider: FC<PropsWithChildren> = props => {
    const [themeInfo, setThemeInfo] = useState<ThemeInfo<T> | undefined>(initTheme)
    return createElement(ThemeContext.Provider, { value: [themeInfo, setThemeInfo] }, props.children)
  }

  function useTheme() {
    const contextValue = useContext(ThemeContext)
    if (!contextValue) {
      throw new Error('不处于主题上下文内')
    }
    const [themeInfo, setThemeInfo] = contextValue

    const edit = useMemo(() => {
      const safeSetThemeInfo = (fn: (themeInfo: ThemeInfo<T>) => ThemeInfo<T>) => {
        setThemeInfo(themeInfo => {
          if (!themeInfo) {
            throw new Error('没有应用主题')
          }
          return fn(themeInfo)
        })
      }
      const setThemeEditRecorder = (fn: (themeInfo: ThemeInfo<T>) => ThemeEditRecorder<T>) => {
        safeSetThemeInfo(themeInfo => {
          return { ...themeInfo, themeEditRecorder: fn(themeInfo) }
        })
      }
      const setThemeMapEditRecorder = (fn: (themeInfo: ThemeInfo<T>) => ThemeMapEditRecorder) => {
        safeSetThemeInfo(themeInfo => {
          return { ...themeInfo, themeMapEditRecorder: fn(themeInfo) }
        })
      }
      const theme = {
        /** 创建或替换与`name`同名的主题元 */
        add: (name: string, value: ThemeItem<T>) => {
          setThemeEditRecorder(themeInfo => {
            return addThemeItem(themeInfo.themeEditRecorder, name, value)
          })
        },
        /** 删除与`name`同名的主题元 */
        delete: (name: string) => {
          setThemeEditRecorder(themeInfo => {
            return deleteThemeItem(themeInfo.theme, themeInfo.themeEditRecorder, name)
          })
        },
        /** 修改与`name`同名的主题元 */
        change: (name: string, value: ThemeItemValue<T>) => {
          setThemeEditRecorder(themeInfo => {
            return changeThemeItem(themeInfo.theme, themeInfo.themeEditRecorder, name, value)
          })
        },
        /** 修改与`name`同名的主题元的描述 */
        changeDesc: (name: string, desc: string) => {
          setThemeEditRecorder(themeInfo => {
            return changeThemeItemDesc(themeInfo.theme, themeInfo.themeEditRecorder, name, desc)
          })
        }
      }

      const themeMap = {
        /** 创建或替换key指示的子映射 */
        add: (themeMapEditRecorderKey: string, value: SubThemeMap | PropertyMap) => {
          setThemeMapEditRecorder(themeInfo => {
            return addThemeMap(themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, value)
          })
        },
        /** 删除key指示的子映射 */
        delete: (themeMapEditRecorderKey: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return deleteThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey)
          })
        },
        /** 修改key指示的子映射 */
        change: (themeMapEditRecorderKey: string, value: ThemeMap | PropertyMapValue) => {
          setThemeMapEditRecorder(themeInfo => {
            return changeThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, value)
          })
        },
        /** 修改key指示的子映射的简介 */
        changeDesc: (themeMapEditRecorderKey: string, desc: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return changeThemeMapDesc(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, desc)
          })
        }
      }

      return {
        /** 主题变更函数 */
        theme,
        /** 映射变更函数 */
        themeMap
      }
    }, [setThemeInfo])

    const checkedSetThemeInfo = useCallback((themeInfo: ThemeInfo<T>) => {
      themeInfo.theme.keys().forEach(checkThemeItemName)
      setThemeInfo(themeInfo)
    }, [setThemeInfo])

    return {
      /** 主题信息 */
      themeInfo,
      /** 变更操作 */
      edit,
      /** 设置主题信息 */
      setThemeInfo: checkedSetThemeInfo
    }
  }

  return {
    /** 主题上下文 */
    ThemeProvider,
    /** 主题钩子 */
    useTheme
  }
}

/********************  主题变量系列类型    ********************/

/** 主题变量属性值基础类型 字符串、数字或者主题元的值 */
export type PropertyBaseValue<T> = PropertyMapValue | ThemeItemValue<T>

/** 主题变量属性值类型 基础类型或它的嵌套数组 */
export type PropertyValue<T> = PropertyBaseValue<T> | PropertyValue<T>[]

/** 主题变量属性类型 */
export type Property<T> = ThemeMapItemBaseType & {
  /** 变量值 属性值基础类型或者它的数组 */
  value: PropertyValue<T>
}

/** 具有下层结构的主题变量 */
export type SubThemeVars<T> = ThemeMapItemBaseType & {
  /** 下层结构 */
  children: ThemeVars<T>
}

/** 主题变量类型 */
export type ThemeVars<T> = Map<string, Property<T> | SubThemeVars<T>>

/********************  主题变量系列类型结束    ********************/



/** 从属性映射的`value`获取具体值 */
export function getValue<T>(theme: Theme<T>, value: PropertyMapValue): PropertyValue<T> {
  /** 取得非数组映射值应用主题后的结果 */
  if (Array.isArray(value)) {
    return value.map(v => getValue(theme, v))
  } else {
    if (typeof value !== 'string') {
      return value
    }
    const info = getInfoFromExtendThemeItemName(value)
    if (!info) {
      return value
    }
    const themeItem = theme.get(info.themeItemName)
    if (!themeItem) {
      return value
    }
    if (typeof themeItem.value !== 'string' || !TinyColor2(themeItem.value).isValid()) {
      return themeItem.value
    }
    const colors = generate(themeItem.value)
    return TinyColor2(colors[info.level]).setAlpha(info.opacity / 100).toHex()
  }
}

/** 取得主题变量 */
export function getThemeVars<T>(theme: Theme<T>, themeMap: ThemeMap): ThemeVars<T> {
  const themeVars: ThemeVars<T> = new Map()
  themeMap.entries().forEach(([key, value]) => {
    if (isPropertyMap(value)) {
      themeVars.set(key, { desc: value.desc, value: getValue(theme, value.value) })
    } else {
      themeVars.set(key, { desc: value.desc, children: getThemeVars(theme, value.children) })
    }
  })
  return themeVars
}