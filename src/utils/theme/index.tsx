'use client'

import { createTheme } from "@/lib/Theme"

export const { ThemeProvider, useTheme } = createTheme({
  themeVar: new Map([
    ['@a', { desc: '主题元@a', value: [1, 'a', ['t']] }],
    ['@b', { desc: '主题元@b', value: '#FFFFFF' }]
  ]),
  themeMap: new Map([
    ['example', { desc: '示例', value: ['t', ['@a', '@b-G9-A90']] }],
    [
      'example1',
      {
        desc: '具有子结构的映射',
        children: new Map([['sub', { desc: 'sub', value: 1 }]])
      }
    ]
  ])
})