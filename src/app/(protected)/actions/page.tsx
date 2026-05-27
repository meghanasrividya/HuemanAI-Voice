import { Suspense } from "react";
import PageContainer from "@/components/layout/PageContainer";
import ActionsPageContent from "@/components/actions/ActionsPageContent";

export default function ActionsPage() {
    return (
        <PageContainer>
            <Suspense fallback={<div className="flex-1 p-6 text-muted-foreground">Loading...</div>}>
                <ActionsPageContent />
            </Suspense>
        </PageContainer>
    );
}
