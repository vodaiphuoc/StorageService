import { Component, ChangeDetectionStrategy, Inject, signal,type OnInit } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
} from '@angular/material/dialog';
  
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { GetAssets } from '@app/user-assets/services/get-assets';

export interface DialogForItem {
    fileId: string,
    name: string,
    isPdf: boolean
}


/**
 * Component for rendering pdf/image
 */
@Component({
    selector: 'app-view-file',
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatProgressBarModule],
    templateUrl: './view-file.html',
    styleUrl: './view-file.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewFile implements OnInit{
    isLoading = signal<boolean>(true);
    safeUrl!: SafeResourceUrl

    constructor(
        private getAssetsService: GetAssets,
        @Inject(MAT_DIALOG_DATA) public data: DialogForItem,
        private domSanitizer: DomSanitizer
    ) { };

    ngOnInit(): void {
        this.getAssetsService.getFile(this.data.fileId)
            .subscribe({
                next: (data: Blob) => {
                    const fileURL = URL.createObjectURL(data);
                    this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(fileURL);
                    this.isLoading.set(false);
                    console.log(this.isLoading())
                    
                },
                error: (err) => {
                    this.isLoading.set(false); // Hide loading spinner on error
                    console.error('File fetch error:', err);
                }
            });
    }
}
