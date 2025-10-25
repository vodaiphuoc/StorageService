import * as z from "zod";

/**
 * Schema for header in view file request
 * on backend
 */
export const ViewFileHeaderSchema = z.object({
    'file-id': z.uuidv4(),
    'content-type': z.string('application/json'),
});

/**
 * Type for header in view file request
 * @type
 */
export type ViewFileHeader = z.infer<typeof ViewFileHeaderSchema>;
