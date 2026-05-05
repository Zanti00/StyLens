import { AnalysisDetail } from "@/components/analysis/AnalysisDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Detail | StyLens",
  description: "View detailed style analysis for your outfit.",
};

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <AnalysisDetail id={id} />
    </div>
  );
}
