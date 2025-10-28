import * as z from "zod";

/**
 * Schema for header in view all file ID request
 * to backend
 */
export const ViewAllFileIdHeaderSchema = z.object({
    'user-id': z.string(),
    'content-type': z.string('application/json'),
});

/**
 * Type for header in view file request
 * @type
 */
export type ViewAllFileIdHeader = z.infer<typeof ViewAllFileIdHeaderSchema>;


export const FileModelSchema = z.object({
    'id': z.uuidv4(),
    'fileName': z.string(),
    'itemType': z.literal(['file', 'folder','image']),
    'createAt': z.iso.date()
});

export type FileModelResponse = z.infer<typeof FileModelSchema>;

/**
 * Schema for header in view file request
 * on backend
 */
export const ViewFileHeaderSchema = ViewAllFileIdHeaderSchema.extend({
    'file-id': z.uuidv4(),
})

/**
 * Type for header in view file request
 * @type
 */
export type ViewFileHeader = z.infer<typeof ViewFileHeaderSchema>;
