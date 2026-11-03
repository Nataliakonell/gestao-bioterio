import type { ReactNode } from "react";

type HeaderContainerProps = {
  children: ReactNode;
};

export function HeaderContainer({ children }: HeaderContainerProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {children}
    </header>
  );
}