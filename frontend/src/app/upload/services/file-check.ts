import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { ALLOWED_FILE_TYPES_MAP } from '@core/models/file-types';

@Injectable({
    providedIn: 'root'
})
export class FileCheck {

    private allowedMimeTypes: string[] = ALLOWED_FILE_TYPES_MAP.map(f => f.mimeType);
    
    public filesCheck(inputFiles: FileList) {
        let hasError: boolean = false;

        for (let i = 0; i < inputFiles.length; i++) {
            const currentFile = inputFiles.item(i) as File;

            if (currentFile.size > environment.maxFileSize) {
                hasError = true;
                console.log(currentFile.name, currentFile.size);

            } else if (!this.isValidMimeType(currentFile.type)) {
                hasError = true;
                console.log(currentFile.name, currentFile.type);
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
