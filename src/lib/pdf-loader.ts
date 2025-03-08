import { pdfjs } from "./pdf-config";
import { DocumentPage } from "@/types/pdf-editor";
import { useEditorStore } from "@/store/useEditorStore";

/**
 * Loads a PDF document from a file
 *
 * @param file - The PDF file to load
 * @returns A promise that resolves when the PDF is loaded
 */
export async function loadPdfDocument(
  file: File,
): Promise<pdfjs.PDFDocumentProxy> {
  try {
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    // Get the number of pages
    const numPages = pdfDocument.numPages;

    // Get the editor store
    const { setPages } = useEditorStore.getState();

    // Prepare pages data
    const pages: DocumentPage[] = [];

    // Process each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });

      pages.push({
        pageIndex: i - 1,
        width: viewport.width,
        height: viewport.height,
      });
    }

    // Update the store with the processed pages
    setPages(pages);

    // Store the PDF document in a global variable for later use
    window._pdfDocument = pdfDocument;

    return pdfDocument;
  } catch (error) {
    console.error("Error loading PDF document:", error);
    throw error;
  }
}

/**
 * Renders a PDF page onto a canvas element
 *
 * @param pageNumber - The 1-indexed page number to render
 * @param canvasElement - The canvas element to render to
 * @param scale - The scale factor to apply to the rendering
 * @returns A promise that resolves when the page is rendered
 */
export async function renderPage(
  pageNumber: number,
  canvasElement: HTMLCanvasElement,
  scale: number = 1.0,
): Promise<void> {
  try {
    if (!window._pdfDocument) {
      throw new Error("No PDF document loaded");
    }

    // Get the page
    const page = await window._pdfDocument.getPage(pageNumber);

    // Create a viewport with the specified scale
    const viewport = page.getViewport({ scale });

    // Set canvas dimensions to match the viewport
    canvasElement.width = viewport.width;
    canvasElement.height = viewport.height;

    // Get the rendering context
    const context = canvasElement.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }

    // Prepare the render context
    const renderContext = {
      canvasContext: context,
      viewport,
    };

    // Render the page
    await page.render(renderContext).promise;
  } catch (error) {
    console.error("Error rendering PDF page:", error);
    throw error;
  }
}

/**
 * Gets PDF coordinates from viewport coordinates
 *
 * @param x - The x coordinate in viewport space
 * @param y - The y coordinate in viewport space
 * @param pageIndex - The page index
 * @param scale - The current scale factor
 * @returns The coordinates in PDF space
 */
export function viewportToPdfCoordinates(
  x: number,
  y: number,
  pageIndex: number,
  scale: number,
): { x: number; y: number; pageIndex: number } {
  return {
    x: x / scale,
    y: y / scale,
    pageIndex,
  };
}

/**
 * Gets viewport coordinates from PDF coordinates
 *
 * @param x - The x coordinate in PDF space
 * @param y - The y coordinate in PDF space
 * @param pageIndex - The page index
 * @param scale - The current scale factor
 * @returns The coordinates in viewport space
 */
export function pdfToViewportCoordinates(
  x: number,
  y: number,
  pageIndex: number,
  scale: number,
): { x: number; y: number; pageIndex: number } {
  return {
    x: x * scale,
    y: y * scale,
    pageIndex,
  };
}

// Augment the Window interface
declare global {
  interface Window {
    _pdfDocument: pdfjs.PDFDocumentProxy;
  }
}
