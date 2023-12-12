import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SilentChat",
  description: "SilentChat",
};


export default function projectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <Suspense>
          <main>{children}</main>
        </Suspense>
  );
}
