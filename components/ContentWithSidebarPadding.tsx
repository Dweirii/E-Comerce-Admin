"use client";

import { useSidebar } from "@/components/ui/sidebar";

export default function ContentWithSidebarPadding({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useSidebar();

  return (
    <main
      className={`transition-all duration-300 ease-in-out w-full`}
    >
      {children}
    </main>
  );
}
