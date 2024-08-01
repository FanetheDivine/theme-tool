import { FC } from "react";
import { ThemeVar } from "./components/ThemeVar";
import { Divider } from "antd";
import { ThemeContent } from "./components/ThemeContent";
import { ThemeMap } from './components/ThemeMap'

const Page: FC = () => {
  return (
    <main className='flex w-full h-full'>
      <ThemeVar className='flex-grow-0 w-48 px-2 py-1'></ThemeVar>
      <Divider type='vertical' className='h-full bg-gray'></Divider>
      <ThemeContent className='flex-auto'></ThemeContent>
      <Divider type='vertical' className='h-full bg-gray'></Divider>
      <ThemeMap className='flex-grow-0 min-w-60'></ThemeMap>
    </main>
  )
}

export default Page