import React, { useEffect, useRef, useState } from "react";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";
import { usePdfDocument } from "./hooks/usePdfDocument";
import { openPdfFiles, savePdfFile, showInFolder } from "./lib/fileDialogs";
import { renderPageToCanvas, extractTextRects } from "./lib/pdfRender";
import { addInkPath, addTextBox, addHighlightRects, extractPages, insertBlankPage, mergePdfs, rotatePage } from "./lib/pdfWrite";
import type { OpenedFile } from "./lib/types";

export default function App() {
  const [file, setFile] = useState<OpenedFile | undefined>(undefined);
  const [buffers, setBuffers] = useState<Uint8Array | null>(null);
  const { pdf, pageCount } = usePdfDocument(file);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!pdf) return;
    setPageIndex(0);
  }, [pdf]);

  const open = async () => {
    const files = await openPdfFiles();
    if (!files || files.length === 0) return;
    if (files.length === 1) {
      setFile(files[0]);
      setBuffers(files[0].data);
    } else {
      const merged = await mergePdfs(files.map(f => f.data));
      const name = files.map(f => f.name).join("+") + ".pdf";
      const combined: OpenedFile = { name, data: merged };
      setFile(combined);
      setBuffers(merged);
    }
  };

  const save = async () => {
    if (!buffers || !file) return;
    const path = await savePdfFile(file.name.replace(/\.pdf$/i, "") + "_edited.pdf", buffers);
    if (path) { await showInFolder(path); }
  };

  const newDoc = async () => {
    const blank = await insertBlankPage(new Uint8Array(), 0).catch(async () => {
      const a4 = await (await import("pdf-lib")).PDFDocument.create();
      a4.addPage([595, 842]);
      return a4.save();
    });
    const nf: OpenedFile = { name: "Untitled.pdf", data: blank };
    setFile(nf);
    setBuffers(blank);
  };

  const onMerge = async () => {
    const files = await openPdfFiles();
    if (!files || files.length === 0 || !buffers) return;
    const merged = await mergePdfs([buffers, ...files.map(f => f.data)]);
    setBuffers(merged);
    setFile({ name: file?.name ?? "Merged.pdf", data: merged });
  };

  const onExtract = async () => {
    if (!buffers) return;
    const extracted = await extractPages(buffers, [pageIndex]);
    const saved = await savePdfFile(`page-${pageIndex + 1}.pdf`, extracted);
    if (saved) await showInFolder(saved);
  };

  const onRotate = async () => {
    if (!buffers) return;
    const out = await rotatePage(buffers, pageIndex, 90);
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
  };

  const onPrint = () => {
    window.print();
  };

  const onSearch = async (query: string) => {
    if (!pdf) return;
    const rects = await extractTextRects(pdf, pageIndex, query);
    const canvas = document.querySelector<HTMLCanvasElement>("#pageCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    await renderPageToCanvas(pdf, pageIndex, zoom, canvas);
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "yellow";
    for (const r of rects) {
      ctx.fillRect(r.x, canvas.height - r.y - r.h, r.w, r.h);
    }
    ctx.restore();
  };

  const onInkStroke = async (pts: {x:number;y:number}[]) => {
    if (!buffers) return;
    const out = await addInkPath(buffers, pageIndex, pts, 2);
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
  };

  const addText = async () => {
    if (!buffers) return;
    const text = prompt("Text to insert") ?? "";
    const out = await (await import("./lib/pdfWrite")).addTextBox(buffers, pageIndex, text, 72, 72);
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
  };

  const highlightSelection = async () => {
    if (!pdf || !buffers) return;
    const q = prompt("Highlight text contains") ?? "";
    const rects = await extractTextRects(pdf, pageIndex, q);
    const out = await (await import("./lib/pdfWrite")).addHighlightRects(buffers, pageIndex, rects);
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
  };

  // --- New: OCR, signature image, redaction raster ---
  const doOCRCurrentPage = async () => {
    if (!pdf || !buffers) return;
    const canvas = document.createElement("canvas");
    await renderPageToCanvas(pdf, pageIndex, 2, canvas);
    const { ocrCanvas } = await import("./lib/ocr");
    const words = await ocrCanvas(canvas, "eng");
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const doc = await PDFDocument.load(buffers);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.getPage(pageIndex);
    for (const w of words) {
      if (!w.text) continue;
      const size = Math.max(8, w.h / 1.2);
      page.drawText(w.text, { x: w.x, y: w.y, size, font, opacity: 0 });
    }
    const out = await doc.save();
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
    alert("OCR לעמוד הנוכחי הושלם");
  };

  const doSignature = async () => {
    if (!buffers) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";
    input.onchange = async () => {
      const f = (input.files && input.files[0])!;
      const arr = new Uint8Array(await f.arrayBuffer());
      const { placeSignatureImage } = await import("./lib/signature");
      const out = await placeSignatureImage(buffers, pageIndex, arr, 72, 72, 200, 80);
      setBuffers(out);
      setFile(prev => prev ? { ...prev, data: out } : prev as any);
    };
    input.click();
  };

  const doRedactBox = async () => {
    if (!pdf || !buffers) return;
    const q = prompt("הכנס מלבן לרדקט בפורמט x,y,w,h למשל 100,100,200,60");
    if (!q) return;
    const [x,y,w,h] = q.split(",").map(s => parseFloat(s.trim()));
    const { redactByRasterize } = await import("./lib/redact");
    const out = await redactByRasterize(buffers, pdf as any, pageIndex, 2, [{ x, y, w, h }]);
    setBuffers(out);
    setFile(prev => prev ? { ...prev, data: out } : prev as any);
    alert("בוצע רדקט לעמוד באמצעות רסטריזציה");
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onOpen={open} onSave={save} onMerge={onMerge} onNew={newDoc}
        onExtract={onExtract} onRotate={onRotate}
        zoom={zoom} setZoom={setZoom} tool={"ink"} setTool={()=>{}} onPrint={onPrint}
      />
      <SearchBox onSearch={onSearch} />
      <div className="flex flex-1 min-h-0">
        <Sidebar pageCount={pageCount} current={pageIndex} onJump={setPageIndex} />
        <div className="flex-1 overflow-auto">
          {pdf ? (
            <div className="flex flex-col items-center">
              <canvas id="pageCanvas" ref={pageCanvasRef} className="canvas block mt-4" />
              <PagePortal
                pdf={pdf}
                pageIndex={pageIndex}
                zoom={zoom}
                onInkStroke={onInkStroke}
              />
              <div className="flex gap-2 my-4">
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}>Prev</button>
                <span>Page {pageIndex + 1} of {pageCount}</span>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}>Next</button>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={addText}>Add Text</button>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={highlightSelection}>Highlight by text</button>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={doSignature}>Add Signature</button>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={doOCRCurrentPage}>OCR Page</button>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={doRedactBox}>Redact Box</button>
              </div>
            </div>
          ) : (
            <div className="h-full grid place-items-center text-gray-500">
              <div>
                <p className="text-lg">Open a PDF to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PagePortal(props: {
  pdf: any; pageIndex: number; zoom: number; onInkStroke: (pts:{x:number;y:number}[]) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    const run = async () => {
      if (!props.pdf || !ref.current) return;
      await renderPageToCanvas(props.pdf, props.pageIndex, props.zoom, ref.current);
    };
    run();
  }, [props.pdf, props.pageIndex, props.zoom]);

  const drawing = React.useRef<{ pts: {x:number;y:number}[] } | null>(null);
  const toLocal = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left), y: rect.height - (e.clientY - rect.top) };
  };

  const onDown = (e: React.MouseEvent) => {
    drawing.current = { pts: [toLocal(e)] };
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drawing.current) return;
    drawing.current.pts.push(toLocal(e));
  };
  const onUp = () => {
    if (!drawing.current) return;
    props.onInkStroke(drawing.current.pts);
    drawing.current = null;
  };

  return (
    <canvas
      ref={ref}
      className="canvas block"
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
    />
  );
}
