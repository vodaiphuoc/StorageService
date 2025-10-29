import { Component, signal, type OnInit, inject } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { GetAssets, type FileTreeNode } from './services/get-assets';
import { type FileModelResponse } from '@clone-google-drive/commons';
import { NotificationService } from '@core/services/notification';

import {
    MatDialog
} from '@angular/material/dialog';
  

import { ViewFile, type DialogForItem } from './components/view-file/view-file';

@Component({
    selector: 'app-user-assets',
    imports: [MatTableModule, MatIconModule],
    templateUrl: './user-assets.html',
    styleUrl: './user-assets.css'
})
export class UserAssets implements OnInit {
    itemList = signal<FileTreeNode[]>([]);
    displayedColumns: string[] = ['fileName','createAt'];

    readonly dialog = inject(MatDialog);

    constructor(
        private getAssetsService: GetAssets,
        private notiService: NotificationService
    ) { }
    
    ngOnInit() {
        this.getAssetsService.getAllFileMetaData()
            .subscribe({
                next: (results: FileModelResponse[]) => {
                    const fileTree: FileTreeNode[] = GetAssets.convertFlatListToTree(results);
                    this.itemList.set(fileTree);
                },
                error: (err) => {
                    let errorMessage: string;
                    if (err.error instanceof ErrorEvent) {
                        errorMessage = `Client Error: ${err.error.message}`;
                    } else if (err.error && typeof err.error === 'object' && err.error.message) {
                        errorMessage = err.error.message
                    } else {
                        errorMessage = `Error ${err.status}: ${err.message}`;
                    }
                    
                    this.notiService.error('Get All file', errorMessage, 5);
                    
                }
            });
        
    }

    /**
     * Render item by condition
     *  - if pdf/image: open dialog `ViewFile`
     *  - if folder: change itemList to childrens of current node
     * @param row 
     */
    onItemSelect(row: FileTreeNode) {
        console.log('onItemSelect: ',row);
        if (row.isFile) {
            console.log('click to show file');
            const selectedFile = row.file as FileModelResponse;

            const dialogDataConfig: DialogForItem = {
                fileId: selectedFile.id,
                name: selectedFile.fileName,
                isPdf: selectedFile.mimeType.startsWith('image')? false: true
            }
            this.dialog.open(ViewFile, {
                data: dialogDataConfig,
                minWidth: '80vw'
            });
            
        } else {
            const currentTree = this.itemList();
            const retrievalNode = currentTree.find(n => n.name == row.name);
            
            if (!retrievalNode) {
                console.log('error find node');
            } else {
                const childrens = retrievalNode.children as FileTreeNode[];
                this.itemList.set(childrens);
            }
        }

    }

}
