import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 px-4 py-2 sm:px-6 md:px-10">
      {children}
    </div>
  );
}