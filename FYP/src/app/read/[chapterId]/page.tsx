"use client";

import { useParams } from "@/compat/next-navigation";
import { ImmersiveReader } from "@/features/reader/ImmersiveReader";

export default function ReadPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  return <ImmersiveReader chapterId={chapterId} />;
}
