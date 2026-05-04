"use client";

import React, { useState } from "react";
import { OutfitUploader } from "@/components/analysis/OutfitUploader";
import { CheckCircle2 } from "lucide-react";

interface HomepageClientProps {
  initialUser: any;
}

export default function HomepageClient({ initialUser }: HomepageClientProps) {
  const [file, setFile] = useState<File | null>(null);

  const displayName =
    initialUser?.user_metadata?.full_name?.split(" ")[0] ||
    initialUser?.email?.split("@")[0] ||
    "Stylist";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-20 space-y-4">
        <h1 className="text-4xl md:text-7xl font-bold font-outfit text-slate-900 tracking-tight">
          Good day, {displayName}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Upload a photo of your outfit and get instant, expert feedback from
          your personal AI stylist.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <OutfitUploader onFileSelect={setFile} />
      </div>
    </div>
  );
}
