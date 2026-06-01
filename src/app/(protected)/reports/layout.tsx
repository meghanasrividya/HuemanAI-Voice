import { ReactNode } from "react";

export default function ReportsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-6 -my-6 h-[calc(100%+3rem)] overflow-hidden">
            {children}
        </div>
    );
}
