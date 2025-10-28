import { Component, signal, type OnInit, type OnDestroy } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';

import { GetAssets } from './services/get-assets';
import { type FileModelResponse } from '@clone-google-drive/commons';
import { NotificationService } from '@core/services/notification';

import { ViewFolder } from './components/view-folder/view-folder';
import { ViewFile } from './components/view-file/view-file';

@Component({
    selector: 'app-user-assets',
    imports: [MatTableModule, MatIconModule, ViewFolder, ViewFile],
    templateUrl: './user-assets.html',
    styleUrl: './user-assets.css'
})
export class UserAssets implements OnInit {
    itemList = signal<FileModelResponse[]>([]);
    displayedColumns: string[] = ['fileName', 'createAt'];

    renderType = signal<"file"|"folder"|"image">("folder");

    safeFileURL: SafeResourceUrl = '';

    constructor(
        private getAssetsService: GetAssets,
        private notiService: NotificationService,
        private domSanitizer: DomSanitizer
    ) { }
    
    ngOnInit() {
        this.renderType.set("folder");
        this.getAssetsService.getAllFileMetaData()
            .subscribe({
                next: (results: FileModelResponse[]) => {
                    this.itemList.update(v => [...v, ...results]);
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

    onItemSelect(row: FileModelResponse) {
        console.log(row);
        this.getAssetsService.getFile(row.id)
            .subscribe({
                next: (data: Blob) => {
                    if (row.itemType === 'file') {
                        const fileURL = URL.createObjectURL(data);
                        this.safeFileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(fileURL);

                    }
                    
                }
            });
    }

}
