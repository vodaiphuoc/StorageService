import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, filter, tap, concatMap, catchError, throwError } from 'rxjs';
import type {
    InitUploadHeaders,
    InitUploadBody,
    InitUploadReponse,
    ChunkUploadHeaders
} from '@clone-google-drive/commons';

@Injectable({
    providedIn: 'root'
})
export class ChunkUpload {
    private chunkSize = 2 * 10 ** 6; // 2 MB per chunk
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

    private uploadFileInChunks(file: File, fileId: string, totalChunks: number): Observable<any> {
        console.log('run upload for file: ', file);
        let currentChunk = 0;

        const uploadNextChunk = (): Observable<any> => {
            if (currentChunk >= totalChunks) {
                // All chunks uploaded, signal completion
                return this.http.post(`${this.baseUrl}/complete`, { fileId: fileId });
            }

            const start = currentChunk * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);

            // 1. Slice the file to get the current chunk as a Blob
            const chunk = file.slice(start, end, file.type);

            console.log('chunk: ', chunk);

            // 2. Define headers/parameters for the server
            const headersData: ChunkUploadHeaders = {
                'file-id': fileId,
                'content-type': 'application/octet-stream',
                'content-range': `bytes ${start}-${end - 1}/${file.size}`,
                'chunk-index': currentChunk.toString(),
                'total-chunks': totalChunks.toString()
            };
            
            return this.http.post(
                `${this.baseUrl}/chunk-upload`,
                chunk,
                {
                    headers: headersData,
                    reportProgress: true,
                    observe: 'events',
                    responseType: "text"
                }
            )
                .pipe(
                    tap(event => {
                        if (event.type === HttpEventType.UploadProgress) {
                            // 1. PROGRESS HANDLING
                            const chunkProgress = Math.round(100 * event.loaded / (event.total || 1));

                            // You would typically use another RxJS Subject here 
                            // to emit the total upload progress to a UI component.
                            console.log(`Chunk ${currentChunk + 1}/${totalChunks} Progress: ${chunkProgress}%`);
                        }
                    }),
                    filter(event => event.type === HttpEventType.Response),
                    tap(() => {
                        // 2. SUCCESS HANDLING (Chunk complete)
                        currentChunk++;
                        console.log(`Chunk ${currentChunk} successfully uploaded.`);
                    }),
                    // 3. FAILURE HANDLING
                    catchError((error) => {
                        console.error(`Upload failed for chunk ${currentChunk + 1}:`, error);

                        // Here you can implement retry logic (e.g., attempt to re-upload the same chunk)
                        // For now, we signal an error and stop the chain
                        return throwError(() => new Error(`Chunk upload failed: ${currentChunk + 1}`));
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
                        return this.uploadFileInChunks(currentFile, fileId, totalChunks);
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
