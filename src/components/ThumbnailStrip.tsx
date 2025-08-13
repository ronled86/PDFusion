import React from "react";

export default function ThumbnailStrip({
  pageCount, current, onJump
}: { pageCount: number; current: number; onJump: (i: number) => void }) {
  return (
    <div className="w-28 border-r overflow-auto">
      {Array.from({ length: pageCount }).map((_, i) => (
        <button
          key={i}
          className={`w-full py-2 text-sm text-left px-2 ${i === current ? "bg-blue-50" : ""}`}
          onClick={() => onJump(i)}
        >
          Page {i + 1}
        </button>
      ))}
    </div>
  );
}
