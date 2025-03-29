"use client";


export default function ContentWithSidebarPadding({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <main
      className={`transition-all duration-300 ease-in-out w-full`}
    >
      {children}
    </main>
  );
}
