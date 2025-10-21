import * as z from "zod";

/**
 * Schema for validation custom headers sent in **Initial** upload request
 * on backend
 */
export const InitUploadHeadersSchema = z.object({
    'user-id': z.string(),
    'content-type': z.string('application/json')
});

/**
 * Type for the required custom headers sent in **Initial** upload request
 * @type
 */
export type InitUploadHeaders = z.infer<typeof InitUploadHeadersSchema>;


/**
 * Schema for validation body sent in **Initial** upload request
 * on backend
 */
export const InitUploadBodySchema = z.object({
    'file-name': z.string(),
    'mine-type': z.string(),
    'file-size': z.string().regex(/[0-9]/)
});

/**
 * Type for the required body sent in **Initial** upload request
 * @type
 */
export type InitUploadBody = z.infer<typeof InitUploadBodySchema>;

export interface InitUploadReponse {
    fileId: string
}

/**
 * Schema for validation custom headers sent with each **chunk upload** request
 * on backend
 */
export const ChunkUploadHeadersSchema = z.object({
    'file-id': z.uuidv4(),
    'content-range': z.string().regex(/^bytes/),
    'content-type': z.string('application/octet-stream'),
    'chunk-index': z.string(),
    'total-chunks': z.string().min(1)
});

/**
 * Type for the required custom headers sent with each **chunk upload** request.
 * @type
 */
export type ChunkUploadHeaders = z.infer<typeof ChunkUploadHeadersSchema>;

