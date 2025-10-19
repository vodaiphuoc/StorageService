type requireHeaderFiled = 'File-Id' | 'File-Name' | 'Content-Range' | 'Content-Type' | 'Chunk-Index' | 'Total-Chunks';

/**
 * Type for the required custom headers sent with each chunk request.
 * @type
 */
export type ChunkUploadHeaders = Record<requireHeaderFiled, string>

/**
 * The body is the raw binary data (a Buffer in Express).
 */
export type ChunkUploadBody = Buffer;