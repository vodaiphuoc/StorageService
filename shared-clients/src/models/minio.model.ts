export interface MinioChunkEtag {
    part: number
    etag: string
}

export interface FileEtag {
    etag: string
    versionId: string|null
}