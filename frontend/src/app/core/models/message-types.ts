export type SupportFileTypes = 'image/png' | 'application/pdf'

export interface ClipboardProcessingResult {
    type: "text" | "image" | "file"
    content: string
}