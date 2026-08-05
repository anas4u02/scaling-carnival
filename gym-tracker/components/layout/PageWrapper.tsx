import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`max-w-md mx-auto min-h-screen bg-gray-950 text-gray-100 flex flex-col pb-24 px-4 pt-4 ${className}`}>
      {children}
    </div>
  );
}
