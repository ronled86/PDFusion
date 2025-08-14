import React from "react";
import ThumbnailStrip from "./ThumbnailStrip";

export default function Sidebar(props: {
  pageCount: number;
  current: number;
  onJump: (i: number) => void;
  pdf?: any;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <ThumbnailStrip 
          pageCount={props.pageCount} 
          current={props.current} 
          onJump={props.onJump}
          pdf={props.pdf}
        />
      </div>
    </div>
  );
}
