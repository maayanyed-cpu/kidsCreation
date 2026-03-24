"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Child } from "@/types/child";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { ageTag } from "@/lib/age";

interface Props {
  children: Child[];
  selectedChildId: string;
}

export function ChildSwitcher({ children, selectedChildId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {children.map((child) => {
        const isSelected = child.id === selectedChildId;
        const name = locale === "he" && child.name_he ? child.name_he : child.name;
        const age = ageTag(child.date_of_birth);
        return (
          <button
            key={child.id}
            onClick={() => router.push(`${pathname}?child=${child.id}`)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              isSelected
                ? "bg-[#ff7657] text-white shadow-sm"
                : "bg-[#f5f0eb] text-[#5c4a38] hover:bg-[#ede8e2]"
            }`}
            aria-current={isSelected ? "true" : undefined}
          >
            <span>{child.avatar_emoji}</span>
            <span suppressHydrationWarning>{name} {age}</span>
          </button>
        );
      })}
    </div>
  );
}
