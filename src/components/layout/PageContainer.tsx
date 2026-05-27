import { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function PageContainer({ children }: Props) {
    return (
        <div className="w-full h-full min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
