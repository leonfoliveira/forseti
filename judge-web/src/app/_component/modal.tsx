import React from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-10">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative h-full w-full bg-white m-auto rounded shadow-lg">
        {children}
      </div>
    </div>
  );
}
