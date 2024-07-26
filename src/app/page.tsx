'use client'

import { getEditedTheme, getEditedThemeMap, getThemeVars } from "@/lib/Theme";
import { useTheme } from "@/utils/theme";
import { Button } from "antd";
import { FC } from "react";

const initValue = {
  theme: new Map([
    ['@a', { desc: 'desc', value: [1, ['a']] }]
  ]),
  themeMap: new Map([
    ['example', { desc: 'example', value: ['t', ['@a']] }],
  ])
}


const Page: FC = () => {
  const { themeInfo, edit, setThemeInfo } = useTheme()
  if(themeInfo){
    const editedTheme = getEditedTheme(themeInfo.theme,themeInfo.themeEditRecorder)
    const editedThemeMap = getEditedThemeMap(themeInfo.themeMap,themeInfo.themeMapEditRecorder)
    const themeVars = getThemeVars(editedTheme,editedThemeMap)
    console.log(themeVars.entries())
  }
  
  return (
    <>
      <Button onClick={() => setThemeInfo(initValue)}>初始化</Button>
      <Button onClick={()=>edit.theme.add('@b',{desc:'b',value:'b'})}>加主题元</Button>
      <Button onClick={()=>edit.theme.delete('@b')}>删主题元</Button>
      <Button onClick={()=>edit.theme.change('@a',[])}>改主题元</Button>
      <Button onClick={()=>edit.themeMap.add('example.example1',{desc:'b',value:'b'})}>模板</Button>
      <Button onClick={()=>edit.themeMap.delete('example.example1')}>删模板</Button>
      <Button onClick={()=>edit.themeMap.change('example',1)}>改模板</Button>
    </>
  )
}

export default Page