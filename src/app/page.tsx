'use client'

import { getEditedThemeVar, getEditedThemeMap, getTheme } from "@/lib/Theme";
import { useTheme } from "@/utils/theme";
import { Button } from "antd";
import { FC } from "react";

const initValue = {
  themeVar: new Map([
    ['@a', { desc: 'desc', value: [1, ['a']] }]
  ]),
  themeMap: new Map([
    ['example', { desc: 'example', value: ['t', ['@a', '@b']] }]
  ])
}


const Page: FC = () => {
  const { themeInfo, edit, setThemeInfo } = useTheme()
  if (themeInfo) {
    const editedThemeVar = getEditedThemeVar(themeInfo.themeVar, themeInfo.themeVarEditRecorder)
    const editedThemeMap = getEditedThemeMap(themeInfo.themeMap, themeInfo.themeMapEditRecorder)
    const theme = getTheme(editedThemeVar, editedThemeMap)
    // console.log(JSON.stringify(Array.from(themeInfo.themeVar.entries())))
    // console.log(JSON.stringify(Array.from(themeInfo.themeVarEditRecorder?.entries())))
    // console.log(JSON.stringify(Array.from(editedThemeVar.entries())))

    // console.log(JSON.stringify(Array.from(themeInfo.themeMap.entries())))
    // console.log(JSON.stringify(Array.from(themeInfo.themeMapEditRecorder.entries())))
    // console.log(JSON.stringify(Array.from(editedThemeMap.entries())))

    console.log(JSON.stringify(Array.from(theme.entries())))
  }

  return (
    <div >
      <div>
        <Button onClick={() => setThemeInfo(initValue)}>初始化</Button>
      </div>
      <div>
        <Button onClick={() => edit.themeVar.add('@b', { desc: 'b', value: 'b' })}>加主题元</Button>
        <Button onClick={() => edit.themeVar.delete('@b')}>删主题元</Button>
        <Button onClick={() => edit.themeVar.change('@a', [])}>改主题元</Button>
        <Button onClick={() => edit.themeVar.changeDesc('@a', '描述')}>改主题元描述</Button>
        <Button onClick={() => edit.themeVar.undo()}>撤销主题变量更改</Button>
      </div>
      <div>
        <Button onClick={() => {
          edit.themeMap.add('subThemeMap', '子映射')
          edit.themeMap.addPropertyMap('subThemeMap.example', { desc: 'b', value: 'b' })
        }}
        >
          加模板
        </Button>
        <Button onClick={() => edit.themeMap.delete('subThemeMap')}>删模板</Button>
        <Button onClick={() => edit.themeMap.change('example', 1)}>改模板</Button>
        <Button onClick={() => edit.themeMap.changeDesc('example', '描述')}>改模板描述</Button>
        <Button onClick={() => edit.themeMap.undo()}>撤销映射更改</Button>
      </div>
    </div>
  )
}

export default Page