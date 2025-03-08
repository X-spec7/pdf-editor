import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Field, FieldType } from "@/types/pdf-editor";
import { toast } from "sonner";

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
  filename: string,
  fields: Field[],
): Promise<void> {
  try {
    if (!window._pdfDocument) {
      throw new Error("No PDF document loaded");
    }

    // Get the PDF data from the loaded document
    const data = await window._pdfDocument.getData();
    const pdfBytes = new Uint8Array(data);

    // Load the PDF document with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form from the document
    const form = pdfDoc.getForm();

    // Get the pages
    const pages = pdfDoc.getPages();

    // Embed a standard font for text fields
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add each field to the PDF
    for (const field of fields) {
      const pdfType = mapFieldType(field.type);
      if (!pdfType) continue; // Skip unsupported field types

      // Get the page for this field
      const page = pages[field.position.pageIndex];
      if (!page) continue;

      // Get page dimensions
      const { width, height } = page.getSize();

      // Convert coordinates (PDF coordinate system has origin at bottom-left)
      const x = field.position.x;
      const y = height - field.position.y - field.size.height;

      // Generate a unique field name
      const fieldName = field.label
        ? `${field.label.replace(/\s+/g, "_")}_${field.id}`
        : `field_${field.id}`;

      try {
        switch (pdfType) {
          case "text": {
            // Create a text field
            const textField = form.createTextField(fieldName);
            textField.addToPage(page, {
              x,
              y,
              width: field.size.width,
              height: field.size.height,
              borderWidth: 1,
              borderColor: rgb(0.75, 0.75, 0.75),
            });

            // Set properties
            if (field.required) {
              textField.enableRequired();
            }

            // Set default value if provided
            if (field.value) {
              textField.setText(field.value);
            }

            // Set text appearance options
            textField.setFontSize(12);
            // Use default appearance settings for better compatibility

            break;
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

          case "signature": {
            // Create a signature field specifically configured for digital signatures
            // More comprehensive handling for signature fields
            const signatureFieldName = `Signature_${fieldName}`;
            const signatureField = form.createTextField(signatureFieldName);

            signatureField.addToPage(page, {
              x,
              y,
              width: field.size.width,
              height: field.size.height,
              borderWidth: 1,
              borderColor: rgb(0.75, 0.75, 0.75),
            });

            // Set properties for signature field
            if (field.required) {
              signatureField.enableRequired();
            }

            // Hide any text content for signature field
            signatureField.setFontSize(0);

            // Attempt to configure as a signature field
            // PDF-lib has limited support for true PDF signature fields,
            // but we can make it look like one visually

            // Add a custom appearance using low-level operations
            const formDict = form.acroForm.dict;
            const sigField = signatureField.acroField.dict;

            // Mark the field as specially handled
            sigField.set(pdfDoc.context.obj("FT"), pdfDoc.context.obj("Sig"));

            break;
          }

          case "date": {
            // Create a date field (special text field with date format)
            const dateField = form.createTextField(`Date_${fieldName}`);
            dateField.addToPage(page, {
              x,
              y,
              width: field.size.width,
              height: field.size.height,
              borderWidth: 1,
              borderColor: rgb(0.75, 0.75, 0.75),
            });

            // Set properties
            if (field.required) {
              dateField.enableRequired();
            }

            // Set default value if provided
            if (field.value) {
              dateField.setText(field.value);
            }

            // Set appearance options
            dateField.setFontSize(12);

            break;
          }

          case "initials": {
            // Create an initials field (similar to signature but smaller)
            const initialsFieldName = `Initials_${fieldName}`;
            const initialsField = form.createTextField(initialsFieldName);

            initialsField.addToPage(page, {
              x,
              y,
              width: field.size.width,
              height: field.size.height,
              borderWidth: 1,
              borderColor: rgb(0.75, 0.75, 0.75),
            });

            // Set properties
            if (field.required) {
              initialsField.enableRequired();
            }

            // Hide any text content for signature-type field
            initialsField.setFontSize(0);

            // Attempt to configure as a signature field
            // PDF-lib has limited support for true PDF signature fields,
            // but we can make it look like one visually

            // Add a custom appearance using low-level operations
            const sigField = initialsField.acroField.dict;

            // Mark the field as specially handled
            sigField.set(pdfDoc.context.obj("FT"), pdfDoc.context.obj("Sig"));

            break;
          }
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
    toast.error("Failed to export PDF");
    throw error;
  }
}
