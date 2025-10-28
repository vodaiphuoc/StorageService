import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, filter, tap, concatMap, catchError, throwError } from 'rxjs';
import type {
    InitUploadHeaders,
    InitUploadBody,
    InitUploadReponse,
    ChunkUploadHeaders,
    ChunkEtag,
    completeUploadBody
} from '@clone-google-drive/commons';

@Injectable({
    providedIn: 'root'
})
export class ChunkUpload {
    private chunkSize = 5 * 1024 * 1024;
    private baseUrl: string = "/api/upload";

    constructor(private http: HttpClient) { };

    private initUpload(file: File, totalChunks: number): Observable<InitUploadReponse>{
        const headersData: InitUploadHeaders = {
            'user-id': '123',
            'content-type': 'application/json'
        };

        const bodyData: InitUploadBody = {
            'file-name': file.name,
            'file-path': file.webkitRelativePath,
            'mine-type': file.type,
            'file-size': file.size,
            'total-chunks': totalChunks
        }

        return this.http.post<InitUploadReponse>(
            `${this.baseUrl}/init`,
            bodyData,
            {
                headers: headersData,
                reportProgress: true,
                responseType: 'json'
            }
        )
    };

    private uploadFileInChunks(
        file: File,
        fileId: string,
        uploadId: string,
        totalChunks: number
    ): Observable<any> {
        console.log('run upload for file: ', file);
        let currentChunk = 1;
        let etags: ChunkEtag[]= [];

        const uploadNextChunk = (): Observable<any> => {
            if (currentChunk > totalChunks) {
                console.log(`run complete: ${currentChunk}, ${totalChunks}`);
                const completeRequestBody: completeUploadBody = {
                    "file-id": fileId,
                    "upload-id": uploadId,
                    "etags": etags
                }

                return this.http.post(
                    `${this.baseUrl}/complete`,
                    completeRequestBody,
                    {
                        headers: {
                            'user-id': '123',
                            'content-type': 'application/json'
                        },
                        responseType: "text"
                    }
                );
            }

            const start = (currentChunk-1) * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);

            // 1. Slice the file to get the current chunk as a Blob
            const chunk = file.slice(start, end, file.type);

            console.log(`chunk ${currentChunk}: ${chunk}`);

            // 2. Define headers/parameters for the server
            const headersData: ChunkUploadHeaders = {
                'user-id': '123',
                'file-id': fileId,
                'upload-id': uploadId,
                'content-range': `bytes ${start}-${end - 1}/${file.size}`,
                'content-type': 'application/octet-stream',
                'mine-type': file.type,
                'chunk-index': currentChunk.toString(),
                'total-chunks': totalChunks.toString()
            };
            
            return this.http.post<ChunkEtag>(
                `${this.baseUrl}/chunk-upload`,
                chunk,
                {
                    headers: headersData,
                    reportProgress: true,
                    observe: 'events',
                    responseType: "json"
                }
            )
                .pipe(
                    tap(event => {
                        if (event.type === HttpEventType.UploadProgress) {
                            // 1. PROGRESS HANDLING
                            const chunkProgress = Math.round(100 * event.loaded / (event.total || 1));

                            // You would typically use another RxJS Subject here 
                            // to emit the total upload progress to a UI component.
                            console.log(`Chunk ${currentChunk}/${totalChunks} Progress: ${chunkProgress}%`);
                        }
                    }),
                    filter(event => event.type === HttpEventType.Response),
                    tap((responseEtag: HttpResponse<ChunkEtag>) => {
                        console.log(`Chunk ${currentChunk} successfully uploaded.`);
                        // 2. SUCCESS HANDLING (Chunk complete)
                        const etag = responseEtag.body as ChunkEtag;
                        currentChunk++;
                        etags.push(etag);
                        console.log(`Current etags: ${etags}`);
                    }),
                    // 3. FAILURE HANDLING
                    catchError((error) => {
                        console.error(`Upload failed for chunk ${currentChunk}:`, error);

                        // Here you can implement retry logic (e.g., attempt to re-upload the same chunk)
                        // For now, we signal an error and stop the chain
                        return throwError(() => new Error(`Chunk upload failed: ${currentChunk}`));
                    }),
                    // 4. CONTINUE: Recursively call the next chunk upload only on success
                    concatMap(() => uploadNextChunk())

                );
        };

        // Start the process
        return uploadNextChunk();
    }

    public uploadFiles(inputFiles: FileList) {
        for (let i = 0; i < inputFiles.length; i++) {
            const currentFile = inputFiles.item(i) as File;
            const totalChunks = Math.ceil(currentFile.size / this.chunkSize);

            this.initUpload(currentFile, totalChunks)
                .pipe(
                    concatMap((reponse: InitUploadReponse) => {
                        const fileId = reponse.fileId;
                        const uploadId = reponse.uploadId;
                        return this.uploadFileInChunks(
                            currentFile,
                            fileId,
                            uploadId,
                            totalChunks
                        );
                })
            )
                .subscribe({
                    next: (result) => {
                        // This 'next' fires for every successful chunk response due to the concatMap structure,
                        // or when the entire chain completes (depending on how concatMap is terminated).
                        console.log('Upload in progress:', result);
                    },
                    error: (err) => {
                        console.error('Upload failed:', err);
                    },
                    complete: () => {
                        console.log('File upload completed successfully!');
                    }
            })

        }
    }


}
