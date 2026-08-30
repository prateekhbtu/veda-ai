import { ReviewWorkspace } from "@/components/review-workspace";

export default async function ReviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <ReviewWorkspace sessionId={sessionId} />;
}
