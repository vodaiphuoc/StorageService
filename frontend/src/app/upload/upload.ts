import { Component,ElementRef, ViewChild, inject } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ALLOWED_ACCEPT_STRING } from '@core/models/file-types';
import { FileCheck } from './services/file-check';
import { ChunkUpload } from './services/chunk-upload';
import { Notification } from '@app/notification/notification';

@Component({
    selector: 'app-upload',
    imports: [MatButtonModule, MatMenuModule, MatIconModule, Notification],
    templateUrl: './upload.html',
    styleUrl: './upload.css'
})
export class Upload {
    @ViewChild('file_input') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('folder_input') folderInput!: ElementRef<HTMLInputElement>;

    public allowedFileTypesString: string = ALLOWED_ACCEPT_STRING;

    // file check service
    private fileCheckService: FileCheck = inject(FileCheck);
    private chunkUploadService: ChunkUpload = inject(ChunkUpload);

    selectedFile: File | null = null;

    constructor() {}

    openFileDialog(event: MouseEvent) {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const result = this.fileCheckService.filesCheck(input.files);
            console.log('result of file checking : ', result);
            if (result) {
                this.chunkUploadService.uploadFiles(input.files);
            }
        }
    }

    openFolderDialog(event: MouseEvent) {
        this.folderInput.nativeElement.click();
    }

    onFolderSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        console.log(input);
        if (input.files && input.files.length > 0) {
            const result = this.fileCheckService.filesCheck(input.files);
            console.log('result of file checking in folder: ', result);
            if (result) {
                this.chunkUploadService.uploadFiles(input.files);
            }
        }
    }

}
