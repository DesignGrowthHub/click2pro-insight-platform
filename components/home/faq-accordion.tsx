"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: readonly FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <Card key={item.question} className="overflow-hidden">
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              onClick={() => {
                setOpenIndex(isOpen ? null : index);
              }}
            >
              <div className="space-y-3 text-left">
                <Badge variant="outline">FAQ</Badge>
                <p className="text-[1.08rem] font-semibold leading-7 text-foreground sm:text-[1.14rem]">
                  {item.question}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-muted transition-transform duration-300",
                  isOpen && "rotate-180 text-foreground"
                )}
              >
                <ChevronDownIcon className="h-4 w-4" />
              </span>
            </button>
            <div className={cn("faq-panel", isOpen && "faq-panel-open")}>
              <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8 lg:px-9 lg:pb-9">
                <div className="subtle-divider mb-5" />
                <p className="body-md reading-column-tight">{item.answer}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
