import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, filter, tap, concatMap, catchError, throwError } from 'rxjs';
import type { ChunkUploadHeaders } from '@clone-google-drive/commons';

@Injectable({
    providedIn: 'root'
})
export class ChunkUpload {
    private chunkSize = 5*10**6; // 5 MB per chunk

    constructor(private http: HttpClient) {}
  
    private uploadFileInChunks(file: File): Observable<any> {
        console.log('run upload for file: ', file);
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        let currentChunk = 0;
        const fileId = Date.now().toString(); // A unique ID for the server to reassemble
    
        const uploadNextChunk = (): Observable<any> => {
            if (currentChunk >= totalChunks) {
            // All chunks uploaded, signal completion
                return this.http.post('/complete', { fileId: fileId });
            }
    
            const start = currentChunk * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);
            
            // 1. Slice the file to get the current chunk as a Blob
            const chunk = file.slice(start, end);
    
            // 2. Define headers/parameters for the server
            const headersData: ChunkUploadHeaders = {
                'File-Id': fileId,
                'File-Name': file.name,
                'Content-Type': 'application/octet-stream',
                'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
                'Chunk-Index': currentChunk.toString(),
                'Total-Chunks': totalChunks.toString()
            };
            
            return this.http.post(
                'chunk-upload',
                chunk,
                {
                    headers: headersData,
                    reportProgress: true,
                    observe: 'events'
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
            this.uploadFileInChunks(currentFile)
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
                    // Now call the finalize endpoint
                }
            });
        }
    }


}


  