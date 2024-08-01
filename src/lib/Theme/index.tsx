import { createContext, createElement, FC, PropsWithChildren, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { type ThemeItem, type ThemeVar, type ThemeVarEditRecorder, addThemeItem, deleteThemeItem, changeThemeItemValue, getInfoFromExtendThemeItemName, ThemeItemValue, checkThemeItemName, changeThemeItemDesc, undoThemeVarChange } from './ThemeVar'
import { addThemeMap, addThemeMapPropertyMap, changeThemeMap, changeThemeMapDesc, deleteThemeMap, isPropertyMap, PropertyMapValue, SubThemeMap, ThemeMapItemBaseType, undoThemeMapChange, type PropertyMap, type ThemeMap, type ThemeMapEditRecorder } from './ThemeMap'
import { generate } from '@ant-design/colors';
import TinyColor2 from 'tinycolor2'

export type { ThemeItemBaseValue, ThemeItemValue, ThemeItem, ThemeVar, ThemeVarEdit, ThemeVarEditRecorder } from './ThemeVar'
export type { PropertyMapBaseValue, PropertyMapValue, ThemeMapItemBaseType, PropertyMap, SubThemeMap, ThemeMap, ThemeMapEdit, ThemeMapEditRecorder } from './ThemeMap'
export { getEditedThemeVar, checkThemeItemName, getInfoFromExtendThemeItemName, isDeletedThemeItem, isEditedThemeItem, isOriginThemeItem } from './ThemeVar'
export { getEditedThemeMap, isPropertyMap } from './ThemeMap'

/** 主题信息 */
export type ThemeInfo<T> = {
  themeVar: ThemeVar<T>,
  themeMap: ThemeMap,
  themeVarEditRecorder: ThemeVarEditRecorder<T>,
  themeMapEditRecorder: ThemeMapEditRecorder
}

/** 将类型中的某些属性变为可选 */
type Option<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
/** 用于初始化的主题 */
type InitThemeInfo<T> = Option<ThemeInfo<T>, 'themeVarEditRecorder' | 'themeMapEditRecorder'>

/** 从initTheme得到主题state的值.这个函数会检查主题元名称. */
function getInitValue<T>(initThemeInfo?: InitThemeInfo<T>): ThemeInfo<T> | undefined {
  if (!initThemeInfo) {
    return undefined
  }
  Array.from(initThemeInfo.themeVar.keys()).forEach(checkThemeItemName)
  const initValue = {
    themeVar: initThemeInfo.themeVar,
    themeMap: initThemeInfo.themeMap,
    themeVarEditRecorder: initThemeInfo.themeVarEditRecorder ?? new Map() as ThemeVarEditRecorder<T>,
    themeMapEditRecorder: initThemeInfo.themeMapEditRecorder ?? new Map() as ThemeMapEditRecorder
  }
  return initValue
}

/** 获取主题上下文和钩子 */
export function createTheme<T = never>(initThemeInfo?: InitThemeInfo<T>) {

  const ThemeContext = createContext<ReturnType<typeof useState<ThemeInfo<T> | undefined>> | null>(null)

  const ThemeProvider: FC<PropsWithChildren> = props => {
    const [themeInfo, setThemeInfo] = useState<ThemeInfo<T> | undefined>(() => getInitValue(initThemeInfo))
    const [, startTransition] = useTransition()
    const setThemeInfoWithTransition: typeof setThemeInfo = useCallback(arg => {
      startTransition(() => {
        setThemeInfo(arg)
      })
    }, [startTransition, setThemeInfo])
    return createElement(ThemeContext.Provider, { value: [themeInfo, setThemeInfoWithTransition] }, props.children)
  }

  function useTheme() {
    const contextValue = useContext(ThemeContext)
    if (!contextValue) {
      throw new Error('不处于主题上下文内')
    }
    const [themeInfo, originSetThemeInfo] = contextValue

    const edit = useMemo(() => {
      const safeSetThemeInfo = (fn: (themeInfo: ThemeInfo<T>) => ThemeInfo<T>) => {
        originSetThemeInfo(themeInfo => {
          if (!themeInfo) {
            throw new Error('没有应用主题')
          }
          return fn(themeInfo)
        })
      }
      const setThemeVarEditRecorder = (fn: (themeInfo: ThemeInfo<T>) => ThemeVarEditRecorder<T>) => {
        safeSetThemeInfo(themeInfo => {
          return { ...themeInfo, themeVarEditRecorder: fn(themeInfo) }
        })
      }
      const setThemeMapEditRecorder = (fn: (themeInfo: ThemeInfo<T>) => ThemeMapEditRecorder) => {
        safeSetThemeInfo(themeInfo => {
          return { ...themeInfo, themeMapEditRecorder: fn(themeInfo) }
        })
      }
      const themeVar = {
        /** 创建或替换与`name`同名的主题元 */
        add: (name: string, value: ThemeItem<T>) => {
          setThemeVarEditRecorder(themeInfo => {
            return addThemeItem(themeInfo.themeVarEditRecorder, name, value)
          })
        },
        /** 删除与`name`同名的主题元 */
        delete: (name: string) => {
          setThemeVarEditRecorder(themeInfo => {
            return deleteThemeItem(themeInfo.themeVar, themeInfo.themeVarEditRecorder, name)
          })
        },
        /** 修改与`name`同名的主题元的值 */
        changeValue: (name: string, value: ThemeItemValue<T>) => {
          setThemeVarEditRecorder(themeInfo => {
            return changeThemeItemValue(themeInfo.themeVar, themeInfo.themeVarEditRecorder, name, value)
          })
        },
        /** 修改与`name`同名的主题元的描述 */
        changeDesc: (name: string, desc: string) => {
          setThemeVarEditRecorder(themeInfo => {
            return changeThemeItemDesc(themeInfo.themeVar, themeInfo.themeVarEditRecorder, name, desc)
          })
        },
        /** 撤销主题变量的变更
         * @param name 寻找对同名主题元的变更.不传会清空所有变更.
        */
        undo: (name?: string) => {
          setThemeVarEditRecorder(themeInfo => {
            return undoThemeVarChange(themeInfo.themeVarEditRecorder, name)
          })
        }
      }

      const themeMap = {
        /** 创建或替换key指示的具有下级结构的子映射 */
        add: (themeMapEditRecorderKey: string, desc: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return addThemeMap(themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, desc)
          })
        },
        /** 创建或替换key指示的属性映射 */
        addPropertyMap: (themeMapEditRecorderKey: string, value: PropertyMap) => {
          setThemeMapEditRecorder(themeInfo => {
            return addThemeMapPropertyMap(themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, value)
          })
        },
        /** 删除key指示的子映射 */
        delete: (themeMapEditRecorderKey: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return deleteThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey)
          })
        },
        /** 修改key指示的属性映射的值 */
        change: (themeMapEditRecorderKey: string, value: PropertyMapValue) => {
          setThemeMapEditRecorder(themeInfo => {
            return changeThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, value)
          })
        },
        /** 修改key指示的子映射的描述 */
        changeDesc: (themeMapEditRecorderKey: string, desc: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return changeThemeMapDesc(themeInfo.themeMap, themeInfo.themeMapEditRecorder, themeMapEditRecorderKey, desc)
          })
        },
        /** 撤销映射变更
         * @param themeMapEditRecorderKey 通过映射索引寻找变更.不传会清空所有变更.
         */
        undo: (themeMapEditRecorderKey?: string) => {
          setThemeMapEditRecorder(themeInfo => {
            return undoThemeMapChange(themeInfo.themeMapEditRecorder, themeMapEditRecorderKey)
          })
        }
      }

      return {
        /** 主题变量变更函数 */
        themeVar,
        /** 映射变更函数 */
        themeMap
      }
    }, [originSetThemeInfo])

    const checkedSetThemeInfo = useCallback((initThemeInfo: InitThemeInfo<T>) => {
      originSetThemeInfo(getInitValue(initThemeInfo))
    }, [originSetThemeInfo])

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

/********************  主题系列类型    ********************/

/** 主题属性值基础类型 字符串、数字或者主题元的值 */
export type PropertyBaseValue<T> = PropertyMapValue | ThemeItemValue<T>

/** 主题属性值类型 基础类型或它的嵌套数组 */
export type PropertyValue<T> = PropertyBaseValue<T> | PropertyValue<T>[]

/** 主题属性类型 */
export type Property<T> = ThemeMapItemBaseType & {
  /** 变量值 属性值基础类型或者它的数组 */
  value: PropertyValue<T>
}

/** 具有下层结构的主题子主题 */
export type SubTheme<T> = ThemeMapItemBaseType & {
  /** 下层结构 */
  children: Theme<T>
}

/** 主题 */
export type Theme<T> = Map<string, Property<T> | SubTheme<T>>

/********************  主题系列类型结束    ********************/


/** 判断主题的映射结果是否是属性值 */
export function isProperty<T>(value: Property<T> | SubTheme<T>): value is Property<T> {
  return 'value' in value
}

/** 从属性映射的`value`获取具体值 */
export function getValue<T>(themeVar: ThemeVar<T>, value: PropertyMapValue): PropertyValue<T> {
  if (Array.isArray(value)) {
    return value.map(v => getValue(themeVar, v))
  } else {
    if (typeof value !== 'string') {
      return value
    }
    const info = getInfoFromExtendThemeItemName(value)
    if (!info) {
      return value
    }
    const themeItem = themeVar.get(info.themeItemName)
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

/** 取得主题 */
export function getTheme<T>(themeVar: ThemeVar<T>, themeMap: ThemeMap): Theme<T> {
  const theme: Theme<T> = new Map()
  Array.from(themeMap.entries()).forEach(([key, value]) => {
    if (isPropertyMap(value)) {
      theme.set(key, { desc: value.desc, value: getValue(themeVar, value.value) })
    } else {
      theme.set(key, { desc: value.desc, children: getTheme(themeVar, value.children) })
    }
  })
  return theme
}