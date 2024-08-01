'use client'

import { EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { FC } from "react";

export const EditThemeMapButton: FC = () => {
  return (
    <>
      <Button type='primary' icon={<EditOutlined />}>编辑主题映射</Button>
    </>
  )
}