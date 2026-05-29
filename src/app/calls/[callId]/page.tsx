import CallDetails from "@/components/calls/info/CallDetails";

type Props = {
  params: Promise<{ callId: string }> | { callId: string };
};

export default async function CallDetailPage({ params }: Props) {
  // Await params to guarantee compatibility across Next.js versions (including Next.js 15+)
  const resolvedParams = await params;
  return <CallDetails callId={resolvedParams.callId} />;
}
