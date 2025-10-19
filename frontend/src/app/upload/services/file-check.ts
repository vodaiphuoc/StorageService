import { Injectable, inject } from '@angular/core';
import { environment } from '@environment';
import { ALLOWED_FILE_TYPES_MAP } from '@core/models/file-types';
import { NotificationService } from '@core/services/notification';

@Injectable({
    providedIn: 'root'
})
export class FileCheck {

    private allowedMimeTypes: string[] = ALLOWED_FILE_TYPES_MAP.map(f => f.mimeType);

    private notiService: NotificationService = inject(NotificationService);
    
    public filesCheck(inputFiles: FileList) {
        let hasError: boolean = false;
        console.log('inputFiles object: ', inputFiles);

        for (let i = 0; i < inputFiles.length; i++) {
            const currentFile = inputFiles.item(i) as File;

            if (currentFile.size > environment.maxFileSize) {
                hasError = true;
                console.log('error in file size with i: ', i);
                this.notiService.error(
                    'File check',
                    `file: '${currentFile.name}' has size ${(currentFile.size / (10 ** 6)).toFixed(2)} MB 
                    large than limit ${environment.maxFileSize / (10 ** 6)} MB`,
                    5
                );

            } else if (!this.isValidMimeType(currentFile.type)) {
                hasError = true;
                this.notiService.error(
                    'File check',
                    `file: '${currentFile.name}' has type ${currentFile.type} is not supported`,
                    5
                );

            } else {
                continue
            }
        }

        return !hasError
    }

    private isValidMimeType(mimeType: string): boolean {
        return this.allowedMimeTypes.some(allowedType => {
          // Handle wildcard types (e.g., 'image/*')
            if (allowedType.endsWith('/*')) {
                const prefix = allowedType.slice(0, -1);
                return mimeType.startsWith(prefix);
            }

            return allowedType === mimeType;
        });
    }
}
