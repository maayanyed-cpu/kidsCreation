import { Suspense } from "react";
import { AppNav } from "@/components/layout/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-[220px]">
      {children}
      <Suspense>
        <AppNav />
      </Suspense>
    </div>
  );
}
