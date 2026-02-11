"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({ value: "", setValue: () => {} });

export function Tabs({ children, defaultValue, value: controlledValue, onValueChange, className }: {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const value = controlledValue ?? internalValue;
  const setValue = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className }: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const { value: activeValue, setValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className }: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}
