import type { Metadata } from "next";
import "./globals.css";
import { FC, PropsWithChildren } from "react";
import { AntdProvider } from "@/lib/AntdProvider";


export const metadata: Metadata = {
  title: "主题工具系统示例",
};

const RootLayout: FC<PropsWithChildren> = props => {
  return (
    <html lang="zh-CN">
      <body>
        <AntdProvider>
          {props.children}
        </AntdProvider>
      </body>
    </html>
  );
}

export default RootLayout