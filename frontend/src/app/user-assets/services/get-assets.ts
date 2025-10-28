import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, filter, tap, concatMap, catchError, throwError } from 'rxjs';

import {
    type ViewAllFileIdHeader,
    type FileModelResponse,
    type ViewFileHeader
} from '@clone-google-drive/commons';

@Injectable({
    providedIn: 'root'
})
export class GetAssets {
    private baseUrl: string = "/api/file";

    constructor(private http: HttpClient) {}

    public getAllFileMetaData(): Observable<FileModelResponse[]> {
        const headersData: ViewAllFileIdHeader = {
            'user-id': '123',
            'content-type': 'application/json'
        };

        return this.http.get<FileModelResponse[]>(
            `${this.baseUrl}/filelist`,
            {
                headers: headersData,
                responseType: 'json'
            }
        )
    }

    public getFile(fileId: string): Observable<Blob> {
        const headersData: ViewFileHeader = {
            'user-id': '123',
            'file-id': fileId,
            'content-type': 'application/json'
        };

        return this.http.get(
            `${this.baseUrl}/fileview`,
            {
                headers: headersData,
                responseType: 'blob'
            }
        )
    }
}
