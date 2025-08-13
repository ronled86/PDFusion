import React from "react";
import ThumbnailStrip from "./ThumbnailStrip";

export default function Sidebar(props: {
  pageCount: number;
  current: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <ThumbnailStrip pageCount={props.pageCount} current={props.current} onJump={props.onJump} />
    </div>
  );
}
