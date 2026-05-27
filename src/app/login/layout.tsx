import { Suspense, ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={<div className="min-h-dvh bg-background" />}>{children}</Suspense>;
}
