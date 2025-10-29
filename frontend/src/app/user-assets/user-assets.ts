import { Component, signal, type OnInit, type OnDestroy, inject } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { GetAssets, type FileTreeNode, findNodeByName } from './services/get-assets';
import { type FileModelResponse } from '@clone-google-drive/commons';
import { NotificationService } from '@core/services/notification';
import type { NotificationModel } from '@core/models/notifications';

import {
    MatDialog
} from '@angular/material/dialog';
  

import { ViewFile, type DialogForItem } from './components/view-file/view-file';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'app-user-assets',
    imports: [MatTableModule, MatIconModule],
    templateUrl: './user-assets.html',
    styleUrl: './user-assets.css'
})
export class UserAssets implements OnInit, OnDestroy {
    fullItemList = signal<FileTreeNode[]>([]);
    viewItemList = signal<FileTreeNode[]>([]);

    nodeListNav = signal<string[]>(['Your Drive','Node 1']);

    // for table
    displayedColumns: string[] = ['fileName','createAt'];

    readonly dialog = inject(MatDialog);
    
    private destroy$ = new Subject<void>();

    constructor(
        private getAssetsService: GetAssets,
        private notiService: NotificationService
    ) { }
    
    ngOnInit() {
        this.notiService.notification$
            .pipe(takeUntil(this.destroy$))
            .subscribe((notification: NotificationModel) => {
                if (notification.source === 'Upload Process') {
                    const fileIds = notification.payload as string[];
                    this.getAssetsService.getFilesMetaData(fileIds)
                        .subscribe({
                            next: (results: FileModelResponse[]) => {
                                
                                const fileTree: FileTreeNode[] = GetAssets.convertFlatListToTree(results);
                                this.fullItemList.update(v => [...v, ...fileTree]);

                                const currentNodeListNav = this.nodeListNav();
                                if (currentNodeListNav.at(-1) === 'Your Drive') {
                                    this.viewItemList.set(this.fullItemList());
                                }
                            }
                        });
                }
        });

        // initial load all file meta data
        this.getAssetsService.getAllFileMetaData()
            .subscribe({
                next: (results: FileModelResponse[]) => {
                    const fileTree: FileTreeNode[] = GetAssets.convertFlatListToTree(results);
                    this.fullItemList.set(fileTree);
                    this.viewItemList.set(fileTree);
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
            this.navigateByNodeName(row.name);
        }

    }

    onNodeNavClick(event: Event, nodeName: string) {
        console.log(event, nodeName);
        if (nodeName === 'Your Drive') {
            this.viewItemList.set(this.fullItemList());
            this.nodeListNav.set(['Your Drive']);
        } else {
            this.navigateByNodeName(nodeName);
        }
        
    }

    private navigateByNodeName(nodeName: string) {
        const currentTree = this.fullItemList();
        const retrievalNode = findNodeByName(currentTree, nodeName);
        
        if (!retrievalNode) {
            console.log('error find node');
        } else {
            const childrens = retrievalNode.children as FileTreeNode[];
            this.viewItemList.set(childrens);
            this.updateNodeListNav(nodeName);
            
        }
    }

    private updateNodeListNav(nodeName: string) {
        this.nodeListNav.update((nodeList: string[]) => {
            if (nodeList.includes(nodeName)) {
                return nodeList.filter((ele, index) => index <= nodeList.indexOf(nodeName));
            } else {
                return [...nodeList, nodeName];
            } 
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
