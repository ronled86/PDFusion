import React from "react";
import type { Tool } from "../lib/types";

export default function Toolbar(props: {
  onOpen: () => void;
  onSave: () => void;
  onMerge: () => void;
  onNew: () => void;
  onExtract: () => void;
  onRotate: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  onPrint: () => void;
}) {
  const ToolButton = ({ id, label }: { id: Tool; label: string }) => (
    <button
      className={`px-3 py-2 rounded ${props.tool === id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
      onClick={() => props.setTool(id)}
      title={label}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <button className="px-3 py-2 bg-emerald-500 text-white rounded" onClick={props.onOpen}>Open</button>
      <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={props.onSave}>Save</button>
      <button className="px-3 py-2 bg-gray-200 rounded" onClick={props.onNew}>New</button>
      <button className="px-3 py-2 bg-gray-200 rounded" onClick={props.onMerge}>Merge</button>
      <button className="px-3 py-2 bg-gray-200 rounded" onClick={props.onExtract}>Extract</button>
      <button className="px-3 py-2 bg-gray-200 rounded" onClick={props.onRotate}>Rotate</button>
      <div className="mx-4 flex items-center gap-2">
        <span>Zoom</span>
        <input type="range" min={0.5} max={3} step={0.05} value={props.zoom}
               onChange={e => props.setZoom(parseFloat(e.target.value))} />
        <span>{Math.round(props.zoom * 100)}%</span>
      </div>
      <ToolButton id="pan" label="Pan" />
      <ToolButton id="select" label="Select" />
      <ToolButton id="highlight" label="Highlight" />
      <ToolButton id="ink" label="Ink" />
      <ToolButton id="text" label="Text" />
      <ToolButton id="image" label="Image" />
      <ToolButton id="note" label="Note" />
      <button className="ml-auto px-3 py-2 bg-gray-200 rounded" onClick={props.onPrint}>Print</button>
    </div>
  );
}
