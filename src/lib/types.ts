export type OpenedFile = { name: string; path?: string; data: Uint8Array };
export type SearchHit = { pageIndex: number; rects: { x: number; y: number; w: number; h: number }[] };
export type Tool = "pan" | "select" | "highlight" | "ink" | "text" | "image" | "note";
