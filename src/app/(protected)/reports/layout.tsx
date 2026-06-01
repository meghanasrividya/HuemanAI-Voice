import { ReactNode } from "react";

export default function ReportsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="h-full w-full overflow-hidden">
            {children}
        </div>
    );
}
