import { Component,ElementRef, ViewChild, inject } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { ALLOWED_ACCEPT_STRING } from '@core/models/file-types';
import { FileCheck } from './services/file-check';

@Component({
    selector: 'app-upload',
    imports: [MatButtonModule, MatMenuModule, MatIconModule],
    templateUrl: './upload.html',
    styleUrl: './upload.css'
})
export class Upload {
    @ViewChild('file_input') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('folder_input') folderInput!: ElementRef<HTMLInputElement>;

    public allowedFileTypesString: string = ALLOWED_ACCEPT_STRING;

    // file check service
    private fileCheckService: FileCheck = inject(FileCheck);

    selectedFile: File | null = null;

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer    
    ) {
        this.matIconRegistry.addSvgIcon(
            'add-file-menu',
            this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/add-files/menu.svg')
        ).addSvgIcon(
            'add-file-icon',
            this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/add-files/attach-file.svg')
        ).addSvgIcon(
            'add-image-icon',
            this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/add-files/add-image.svg')
        ).addSvgIcon(
            'add-folder-icon',
            this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/add-files/folder.svg')
        );
    }

    openFileDialog(event: MouseEvent) {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            console.log(input.files);
            console.log(input.files[0]);
            const result = this.fileCheckService.filesCheck(input.files);
            console.log('result of file checking : ', result);
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
        }
    }

}
