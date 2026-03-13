import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TableColumn = {
  key: string;
  label: string;
  className?: string;
};

type AnalyticsTableProps = {
  eyebrow?: string;
  title: string;
  description: string;
  columns: TableColumn[];
  rows: Array<Record<string, ReactNode>>;
  minWidthClassName?: string;
};

export function AnalyticsTable({
  eyebrow,
  title,
  description,
  columns,
  rows,
  minWidthClassName = "min-w-[920px]"
}: AnalyticsTableProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        {eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null}
        <CardTitle className="text-[1.7rem]">{title}</CardTitle>
        <p className="body-md max-w-3xl">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.01))] p-2">
          <table
            className={cn(
              "w-full table-auto border-separate border-spacing-y-3",
              minWidthClassName
            )}
          >
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 pb-1 text-left text-xs uppercase tracking-[0.18em] text-muted",
                      index === 0 && "pl-5",
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                {columns.map((column, columnIndex) => (
                    <td
                      key={column.key}
                      className={cn(
                        "border-y border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.022))] px-4 py-4 align-top text-sm leading-7 text-foreground transition-colors duration-200 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]",
                        columnIndex === 0 &&
                          "rounded-l-[22px] border-l pl-5 font-semibold text-foreground",
                        columnIndex === columns.length - 1 && "rounded-r-[22px] border-r"
                      )}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
