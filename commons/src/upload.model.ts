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
    'file-path': z.string(),
    'mine-type': z.string(),
    'file-size': z.number(),
    'total-chunks': z.number()
});

/**
 * Type for the required body sent in **Initial** upload request
 * @type
 */
export type InitUploadBody = z.infer<typeof InitUploadBodySchema>;

/**
 * @param {string} fileId
 * @param {string} uploadId
 */
export interface InitUploadReponse {
    fileId: string,
    uploadId: string
}

/**
 * Schema for validation custom headers sent with each **chunk upload** request
 * on backend
 */
export const ChunkUploadHeadersSchema = z.object({
    'user-id': z.string(),
    'file-id': z.uuidv4(),
    'upload-id': z.string(),
    'content-range': z.string().regex(/^bytes/),
    'content-type': z.string('application/octet-stream'),
    'mine-type': z.string(),
    'chunk-index': z.string(),
    'total-chunks': z.string().min(1)
});

/**
 * Type for the required custom headers sent with each **chunk upload** request.
 * @type
 */
export type ChunkUploadHeaders = z.infer<typeof ChunkUploadHeadersSchema>;



/**
 * Schema and type for ChunkEtag between frontend and upload service
 * 
 */
export const chunkEtagSchema = z.object({
    'part': z.number(),
    'etag': z.string()
})
export type ChunkEtag = z.infer<typeof chunkEtagSchema>;

/**
 * Schema and type for complete upload header
 * 
 */
export const completeUploadHeadersSchema = InitUploadHeadersSchema.extend({});
export type completeUploadHeaders = z.infer<typeof completeUploadHeadersSchema>;


/**
 * Schema and type for complete upload body
 * 
 */
export const completeUploadBodySchema = z.object({
    'file-id': z.uuidv4(),
    'upload-id': z.string(),
    'etags': z.array(chunkEtagSchema)
})

export type completeUploadBody = z.infer<typeof completeUploadBodySchema>;