"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import GhibliIcon from "@/components/icons/GhibliIcon";
import CategoryTabs from "@/components/save/CategoryTabs";
import SaveCategoryContent from "@/components/save/SaveCategoryContent";
import { SAVE_CATEGORIES } from "@/data/mock";

function SavePageContentInner() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { get } = searchParams;

  const selectedCategory = useMemo(() => {
    return (get ? get.call(searchParams, "cat") : null) || "wishlist";
  }, [searchParams, get]);

  const switchCategory = (idVal: string) => {
    push(`/save?cat=${idVal}`);
  };

  return (
    <div className="w-full">
      <h2 className="font-pangolin text-[1.9rem] text-ink mb-5 pb-2.5 border-b-2 border-dashed border-earth inline-flex items-center gap-2.5">
        <span className="w-8 h-8">
          <GhibliIcon type="soot" size={32} />
        </span>
        Lưu mọi thứ
      </h2>

      {/* Navigation Tabs */}
      <CategoryTabs
        value={selectedCategory}
        categories={SAVE_CATEGORIES}
        onChange={switchCategory}
      />

      {/* Animated content section keyed by selectedCategory */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1], // cubic-bezier matching Vue transition
          }}
        >
          <SaveCategoryContent category={selectedCategory} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function SavePageContent() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SavePageContentInner />
    </Suspense>
  );
}
