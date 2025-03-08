import * as pdfjs from "pdfjs-dist";

// Import the worker directly - Vite will handle this correctly
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Export the configured pdfjs
export { pdfjs };
