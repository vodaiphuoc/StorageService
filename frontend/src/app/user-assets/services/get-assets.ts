import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, filter, tap, concatMap, catchError, throwError } from 'rxjs';

import {
    type ViewAllFileIdHeader,
    type FileModelResponse,
    type ViewFileHeader,
    type ViewFilesIdBody
} from '@clone-google-drive/commons';

@Injectable({
    providedIn: 'root'
})
export class GetAssets {
    private baseUrl: string = "/api/file";

    constructor(private http: HttpClient) {}

    /**
     * Get all file meta data belong to the user
     * @returns 
     */
    public getAllFileMetaData(): Observable<FileModelResponse[]> {
        const headersData: ViewAllFileIdHeader = {
            'user-id': '123',
            'content-type': 'application/json'
        };
        
        return this.http.get<FileModelResponse[]>(
            `${this.baseUrl}/allFileMeta`,
            {
                headers: headersData,
                responseType: 'json'
            }
        )
    }

    /**
     * Get files meta data belong to the user
     * @returns 
     */
    public getFilesMetaData(fileIds: string[]): Observable<FileModelResponse[]> {
        const headersData: ViewAllFileIdHeader = {
            'user-id': '123',
            'content-type': 'application/json'
        };
        
        const requestBody: ViewFilesIdBody = {
            'file-id-list': fileIds
        }

        return this.http.post<FileModelResponse[]>(
            `${this.baseUrl}/filesMeta`,
            requestBody,
            {
                headers: headersData,
                responseType: 'json'
            }
        )
    }

    public static convertFlatListToTree(fileList: FileModelResponse[]) {
        return buildFileTree(fileList);
    }

    /**
     * Get data of a file
     * @param fileId 
     * @returns 
     */
    public getFile(fileId: string): Observable<Blob> {
        const headersData: ViewFileHeader = {
            'user-id': '123',
            'file-id': fileId,
            'content-type': 'application/json'
        };

        return this.http.get(
            `${this.baseUrl}/fileView`,
            {
                headers: headersData,
                responseType: 'blob'
            }
        )
    }
}


export interface FileTreeNode {
    name: string;
    file?: FileModelResponse
    children?: FileTreeNode[];
    isFile?: boolean;
}

function buildFileTree(fileList: FileModelResponse[]): FileTreeNode[] {
    const root: FileTreeNode[] = [];
    
    const pathSeparator = '/'; 

    for (const file of fileList) {
        let currentNodeList = root;

        if (!file.folderPath) {
            currentNodeList.push({
                name: file.fileName,
                file: file,
                isFile: true
            });
            continue;
        }

        const fullPath = file.folderPath;
        const segments = fullPath.split(pathSeparator).filter(segment => segment.length > 0);
        

        if (segments.length === 0) continue;
      
        // 2. Iterate through each segment except the last one (which is the file/leaf node)
        for (let i = 0; i < segments.length; i++) {
            const segmentName = segments[i];
            
            // Try to find an existing node with this name in the current list
            let node = currentNodeList.find(n => n.name === segmentName);
    
            if (!node) {
            // 3. If the node doesn't exist, create it
                node = {
                    name: segmentName,
                    children: (i < segments.length - 1) ? [] : undefined, // Only folders need a children array initially
                    isFile: (i === segments.length - 1),
                    file: (i === segments.length - 1) ? file: undefined
                };
                currentNodeList.push(node);
            }
    
            // 4. If it's not the last segment (i.e., it's a folder), move down the tree
            if (i < segments.length - 1) {
            // Ensure the children array exists before moving to the next level
                if (!node.children) {
                    node.children = [];
                }
                currentNodeList = node.children;
            }
        }
    }

    return root; 
}
  
export function findNodeByName(nodes: FileTreeNode[], name: string): FileTreeNode | undefined {
    for (const node of nodes) {
        if (node.name === name) return node;
        if (node.children) {
            const found = findNodeByName(node.children, name);
            if (found) return found;
        }
    }
    return undefined;
  }