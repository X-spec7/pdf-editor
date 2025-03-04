export type FieldType = "text" | "signature" | "date"

export interface PDFField {
  id: string
  type: FieldType
  x: number
  y: number
  width: number
  height: number
  value: string
  page: number
}
