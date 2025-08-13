import { useEffect, useState } from "react";
import { loadPdf } from "../lib/pdfRender";
import type { OpenedFile } from "../lib/types";

export const usePdfDocument = (file?: OpenedFile) => {
  const [pdf, setPdf] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!file) return;
      const doc = await loadPdf(file.data);
      if (!alive) return;
      setPdf(doc);
      setPageCount(doc.numPages);
    })();
    return () => { alive = false; };
  }, [file]);
  return { pdf, pageCount };
};
