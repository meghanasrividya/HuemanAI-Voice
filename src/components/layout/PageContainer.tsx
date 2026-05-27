import * as React from "react";

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-full flex flex-col">
      {children}
    </div>
  );
}
