import { useCallback, useMemo } from 'react';
import { createContainer } from 'react-tracked';
import { useImmer } from 'use-immer'
import { enableMapSet } from 'immer';
import { type ThemeItem, type Theme, type ThemeEditRecorder, addThemeItem, deleteThemeItem, changeThemeItem } from './Theme'
import { addThemeMap, changeThemeMap, deleteThemeMap, SubThemeMap, type PropertyMap, type ThemeMap, type ThemeMapEditRecorder } from './ThemeMap'

enableMapSet()

/** 主题信息 */
type ThemeInfo = {
  theme: Theme,
  themeMap: ThemeMap,
  themeEditRecorder: ThemeEditRecorder,
  themeMapEditRecorder: ThemeMapEditRecorder
}

export type { ThemeItem, Theme, PropertyMap, ThemeMap, ThemeInfo, ThemeEditRecorder, ThemeMapEditRecorder }

const { Provider, useTracked } = createContainer(() => {
  const [themeInfo, setThemeInfo] = useImmer<ThemeInfo | null>(null)
  const setCheckedThemeInfo = useCallback((fn: (draft: ThemeInfo) => void) => {
    setThemeInfo(draft => {
      if (draft) {
        fn(draft)
      } else {
        throw new Error('主题不存在')
      }
    })
  }, [setThemeInfo])
  return [themeInfo, setCheckedThemeInfo]
})

/** 主题上下文 */
export const ThemeProvider = Provider

/** 主题钩子 */
export function useTheme() {
  const [themeInfo, setThemeInfo] = useTracked()
  const edit = useMemo(() => {
    const theme = {
      /** 创建或替换与`name`同名的主题元 */
      addThemeItem: (name: string, value: ThemeItem) => {
        setThemeInfo(draft => {
          addThemeItem(draft.themeEditRecorder, name, value)
        })
      },
      /** 删除与`name`同名的主题元 */
      deleteThemeItem: (name: string) => {
        setThemeInfo(draft => {
          deleteThemeItem(draft.theme, draft.themeEditRecorder, name)
        })
      },
      /** 修改与`name`同名的主题元 */
      changeThemeItem: (name: string, value: ThemeItem['value']) => {
        setThemeInfo(draft => {
          changeThemeItem(draft.theme, draft.themeEditRecorder, name, value)
        })
      }
    }

    const themeMap = {
      /** 创建或替换key指示的子映射 */
      addThemeMap: (themeMapEditRecorderKey: string, value: SubThemeMap | PropertyMap) => {
        setThemeInfo(draft => {
          addThemeMap(draft.themeMapEditRecorder, themeMapEditRecorderKey, value)
        })
      },
      /** 删除key指示的子映射 */
      deleteThemeMap: (themeMapEditRecorderKey: string) => {
        setThemeInfo(draft => {
          deleteThemeMap(draft.themeMap, draft.themeMapEditRecorder, themeMapEditRecorderKey)
        })
      },
      /** 修改key指示的子映射 */
      changeThemeMap: (themeMapEditRecorderKey: string, value: SubThemeMap["children"] | PropertyMap["value"]) => {
        setThemeInfo(draft => {
          changeThemeMap(draft.themeMap, draft.themeEditRecorder, themeMapEditRecorderKey, value)
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

  return {
    /** 主题信息 */
    themeInfo,
    /** 变更操作 */
    edit,
    /** 设置主题信息 */
    setThemeInfo
  }
}


/** 取得主题变量 */
export function getThemeVars<T = any>(theme: Theme, themeMap: ThemeMap): T {
  // 未完成
}