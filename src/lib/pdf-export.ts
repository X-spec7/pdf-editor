import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Field, FieldType } from "@/types/pdf-editor";
import { toast } from "sonner";
import { useEditorStore } from "@/store/useEditorStore";
import fontkit from "@pdf-lib/fontkit"

const PX_TO_PT = 0.75;

/**
 * Converts app field type to PDF-lib field type
 *
 * @param fieldType - The app's field type
 * @returns The corresponding PDF-lib field type or null if not supported
 */
const mapFieldType = (fieldType: FieldType): string | null => {
  switch (fieldType) {
    case "text":
      return "text";
    // case "checkbox":
    //   return "checkbox";
    // case "radio":
    //   return "radio";
    // case "dropdown":
    //   return "dropdown";
    case "signature":
    case "initials":
      return "signature";
    case "date":
      return "text"; // Date fields are text fields with special formatting
    default:
      return null; // Some field types might not have direct equivalents
  }
};

/**
 * Exports the current PDF with form fields
 *
 * @param filename - The filename to use for the exported PDF
 * @param fields - The fields to add to the PDF
 * @returns A promise that resolves when the PDF is exported
 */
export async function exportPdfWithFields(
  pdfBlob: Blob,
  filename: string,
  fields: Field[],
): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());

    pdfDoc.registerFontkit(fontkit);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the form from the document
    const form = pdfDoc.getForm();

    // Get the pages
    const pages = pdfDoc.getPages();

    // Add each field to the PDF
    for (const field of fields) {
      const pdfType = mapFieldType(field.type);
      if (!pdfType) continue; // Skip unsupported field types
      if (!field.value) continue; //Skip for fields of which value is missing

      // Get the page for this field
      const page = pages[field.position.pageIndex];
      if (!page) continue;

      // Get page dimensions
      const { width, height } = page.getSize();

      // Convert coordinates (PDF coordinate system has origin at bottom-left)
      const x = field.position.x;
      const y = height - field.position.y - field.size.height / 2 + helveticaFont.heightAtSize(12, {descender: true}) / 2;

      try {
        switch (pdfType) {
          case "text": {
            // Add text field
            page.drawText(field.value, {
              x,
              y,
              font: helveticaFont,
              size: 12 * PX_TO_PT,
              color: rgb(0, 0, 0)
            });

            break;
          }
          
          case "date": {
            // Add date field
            const dateValue = new Date(field.value).toLocaleDateString();

            page.drawText(dateValue, {
              x,
              y,
              size: 12 * PX_TO_PT,
              font: helveticaFont,
              color: rgb(0, 0, 0)
            });

            break;
          }

          case "signature":
            if (field.value.startsWith("data:image")) {
              // Handle drawed signature
              try {
                const signatureBytes = await fetch(field.value).then((res) => res.arrayBuffer())
                const signatureImage = await pdfDoc.embedPng(signatureBytes)
                const signatureDims = signatureImage.scale((field.size.width) / signatureImage.width)

                page.drawImage(signatureImage, {
                  x,
                  y: y - signatureDims.height + helveticaFont.heightAtSize(12, {descender: true}) + 4,
                  width: signatureDims.width,
                  height: signatureDims.height,
                })
              } catch (error) {
                console.error("Error embedding signature image: ", error)
              }
            } else {
              // Handle typed signature

              page.drawText(field.value, {
                x,
                y: y - helveticaFont.heightAtSize(12, {descender: true}) / 2 + helveticaFont.heightAtSize(18, {descender: true}) / 2,
                size: 18 * PX_TO_PT,
                font: helveticaFont,
                color: rgb(0, 0, 0)
              })
            }

          // case "checkbox": {
          //   // Create a checkbox field
          //   const checkboxField = form.createCheckBox(fieldName);
          //   checkboxField.addToPage(page, {
          //     x,
          //     y,
          //     width: field.size.width,
          //     height: field.size.height,
          //     borderWidth: 1,
          //     borderColor: rgb(0.75, 0.75, 0.75),
          //   });

          //   // Set properties
          //   if (field.required) {
          //     checkboxField.enableRequired();
          //   }

          //   // Check the box if value is "true"
          //   if (field.value === "true") {
          //     checkboxField.check();
          //   }

          //   break;
          // }

          // case "radio": {
          //   // Create a radio group if it doesn't exist
          //   let radioGroup;
          //   const groupName = `group_${field.recipientId}`;

          //   try {
          //     radioGroup = form.getRadioGroup(groupName);
          //   } catch (e) {
          //     radioGroup = form.createRadioGroup(groupName);
          //   }

          //   // Add a button to the group
          //   radioGroup.addOptionToPage(field.id, page, {
          //     x,
          //     y,
          //     width: field.size.width,
          //     height: field.size.height,
          //     borderWidth: 1,
          //     borderColor: rgb(0.75, 0.75, 0.75),
          //   });

          //   // Set properties
          //   if (field.required) {
          //     radioGroup.enableRequired();
          //   }

          //   // Select the option if it matches the value
          //   if (field.value === field.id) {
          //     radioGroup.select(field.id);
          //   }

          //   break;
          // }

          // case "dropdown": {
          //   // Create a dropdown field
          //   const dropdownField = form.createDropdown(fieldName);
          //   dropdownField.addToPage(page, {
          //     x,
          //     y,
          //     width: field.size.width,
          //     height: field.size.height,
          //     borderWidth: 1,
          //     borderColor: rgb(0.75, 0.75, 0.75),
          //   });

          //   // Set options
          //   if (field.options && field.options.length > 0) {
          //     dropdownField.setOptions(field.options);
          //   }

          //   // Set properties
          //   if (field.required) {
          //     dropdownField.enableRequired();
          //   }

          //   // Select an option if value is provided
          //   if (field.value && field.options?.includes(field.value)) {
          //     dropdownField.select(field.value);
          //   }

          //   // Set appearance options
          //   dropdownField.setFontSize(12);

          //   break;
          // }
        }
      } catch (fieldError) {
        console.error(`Error adding field ${field.id}:`, fieldError);
        // Continue with other fields even if one fails
      }
    }

    // Save the PDF
    const modifiedPdfBytes = await pdfDoc.save({
      updateFieldAppearances: true, // Important for ensuring fields appear correctly
    });

    // Create a blob from the PDF data
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);

    toast.success("PDF exported successfully with interactive form fields");
    return;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
}
