import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, filter, tap, concatMap, last, map, of, forkJoin, catchError, throwError } from 'rxjs';
import type {
    InitUploadHeaders,
    InitUploadBody,
    InitUploadReponse,
    ChunkUploadHeaders,
    ChunkEtag,
    completeUploadBody,
    completeUploadResponse
} from '@clone-google-drive/commons';

import { NotificationService } from '@core/services/notification';

@Injectable({
    providedIn: 'root'
})
export class ChunkUpload {
    private chunkSize = 5 * 1024 * 1024;
    private baseUrl: string = "/api/upload";

    constructor(private http: HttpClient) { };

    private notiService: NotificationService = inject(NotificationService);

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

                return this.http.post<completeUploadResponse>(
                    `${this.baseUrl}/complete`,
                    completeRequestBody,
                    {
                        headers: {
                            'user-id': '123',
                            'content-type': 'application/json'
                        },
                        responseType: "json"
                    }
                );
            }

            const start = (currentChunk-1) * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);

            // 1. Slice the file to get the current chunk as a Blob
            const chunk = file.slice(start, end, file.type);

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
                            
                            const chunkProgress = Math.round(100 * event.loaded / (event.total || 1));

                            console.log(`Chunk ${currentChunk}/${totalChunks} Progress: ${chunkProgress}%`);
                        }
                    }),
                    filter(event => event.type === HttpEventType.Response),
                    tap((responseEtag: HttpResponse<ChunkEtag>) => {
                        console.log(`Chunk ${currentChunk} successfully uploaded.`);
                        
                        const etag = responseEtag.body as ChunkEtag;
                        currentChunk++;
                        etags.push(etag);
                    }),
                    
                    catchError((error) => {
                        console.error(`Upload failed for chunk ${currentChunk}:`, error);
                        return throwError(() => new Error(`Chunk upload failed: ${currentChunk}`));
                    }),
                
                    // recursive
                    concatMap(() => uploadNextChunk())

                );
        };

        // Start the process
        return uploadNextChunk();
    }

    /**
     * Upload single file or list of files (for folder)
     * @param inputFiles 
     */
    public uploadFiles(inputFiles: FileList) {

        const uploadObservables: Observable<string>[] = Array.from(inputFiles)
            .map((currentFile: File) => {
                const totalChunks = Math.ceil(currentFile.size / this.chunkSize);

                return this.initUpload(currentFile, totalChunks)
                    .pipe(
                        concatMap((response: InitUploadReponse) => {
                            const { fileId, uploadId } = response;
                            return this.uploadFileInChunks(
                                currentFile,
                                fileId,
                                uploadId,
                                totalChunks
                            )
                                .pipe(
                                    last(null, (result: completeUploadResponse) => result.successFileId),
                                    map(result => {
                                        console.log(`File upload completed successfully: ${currentFile.name}`);
                                        return result.successFileId;
                                    }),
                                    catchError(err => {
                                        console.error(`Upload failed for ${currentFile.name}:`, err);
                                        // Return an Observable of null to prevent forkJoin from failing
                                        return of(null as any);
                                    })
                                );
                        })
                    );
            });

        
        forkJoin(uploadObservables)
        .subscribe((allResults: (string | null)[]) => {
            // Filter out nulls (failed uploads) to get only successful IDs
            const successFileIds: string[] = allResults.filter((id): id is string => !!id);

            console.log(`All file processes finished. Successful count: ${successFileIds.length}`);
            
            if (successFileIds.length > 0) {
                console.log(`notiService push: payload: ${successFileIds}, payload length: ${successFileIds.length}`);
                this.notiService.uploadSuccess(
                    'Upload Process',
                    'Upload success',
                    5,
                    successFileIds
                );
            }
        });
        
    }


}
