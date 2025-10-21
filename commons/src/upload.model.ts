import * as z from "zod"; 

/**
 * Schema for validation custom headers sent with each chunk request
 * on backend
 */
// export const ChunkUploadHeadersSchema = z.record(z.literal(requireHeaderFiled), z.string());

export const ChunkUploadHeadersSchema = z.object({
    'file-id': z.string().regex(/[0-9]/),
    'file-name': z.string(),
    'content-range': z.string().regex(/^bytes/),
    'content-type': z.string('application/octet-stream'),
    'chunk-index': z.string(),
    'total-chunks': z.string().min(1)
})


/**
 * Type for the required custom headers sent with each chunk request.
 * @type
 */
export type ChunkUploadHeaders = z.infer<typeof ChunkUploadHeadersSchema>;

