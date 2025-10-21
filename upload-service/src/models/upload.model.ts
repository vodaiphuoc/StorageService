import * as z from "zod"; 

export const ChunkUploadBodySchema = z.instanceof(Buffer);
export type ChunkUploadBody = z.infer<typeof ChunkUploadBodySchema>;
