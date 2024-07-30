'use client'

import { BaseStringValue } from "@/utils/BaseStringValue";
import { Button } from "antd";
import { FC, useState } from "react";
import { debounce } from 'lodash-es'

const Page: FC = () => {
  const initColor = 'rgba(0,255,0,1)'
  const [value, setValue] = useState(initColor)

  return (
    <div className='flex flex-col items-start'>
      {value}
      <Button onClick={() => setValue('#' + Math.random().toString(16).slice(2, 8))} type='primary'>重置</Button>
      <BaseStringValue text={value} value={value} onChange={debounce(setValue, 1000)} className='m-4 w-60'></BaseStringValue>
    </div>
  )
}

export default Page