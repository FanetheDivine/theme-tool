'use client'

import { createTheme } from "@/lib/Theme"

export const { ThemeProvider, useTheme } = createTheme({
  themeVar: new Map([
    ['@a', { desc: '主题元@a', value: [1, 'a', ['t']] }],
    ['@b', { desc: '主题元@b', value: '#FFFFFF' }]
  ]),
  themeMap: new Map([
    ['example', { desc: 'example', value: ['t', ['@a', '@b']] }],
    [
      'children',
      {
        desc: 'children',
        children: new Map([['sub', { desc: 'sub', value: '@b' }]])
      }
    ]
  ])
})