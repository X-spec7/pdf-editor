// import * as pdfjs from "pdfjs-dist";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

// Export the configured pdfjs
export { pdfjs };
