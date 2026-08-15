import { Suspense } from "react";
import { HomePage } from "@/features/discovery/HomePage";

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
