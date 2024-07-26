import type { Metadata } from "next";
import "./globals.css";
import { FC, PropsWithChildren } from "react";
import { AntdProvider } from "@/lib/AntdProvider";
import { ThemeProvider } from "@/utils/theme";


export const metadata: Metadata = {
  title: "主题工具系统示例",
};

const RootLayout: FC<PropsWithChildren> = props => {
  return (
    <html lang="zh-CN">
      <body>
        <AntdProvider>
          <ThemeProvider>
            {props.children}
          </ThemeProvider>
        </AntdProvider>
      </body>
    </html>
  );
}

export default RootLayout