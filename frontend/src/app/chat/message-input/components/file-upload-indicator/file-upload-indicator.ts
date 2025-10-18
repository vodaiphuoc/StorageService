import { Component, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { FileUploadItem } from '../file-upload-item/file-upload-item';
import { ClipboardService } from '../../services/clipboard/clipboard';
// import { SupportFileTypes, ClipboardProcessingResult } from '../../../shared/models/message-types';

@Component({
    selector: 'app-file-upload-indicator',
    imports: [FileUploadItem],
    templateUrl: './file-upload-indicator.html',
    styleUrl: './file-upload-indicator.css',
})
export class FileUploadIndicator implements OnInit, OnDestroy {

    private clipboardService: ClipboardService = inject(ClipboardService);

    private dataSubscription!: Subscription;

    images = signal<string[]>([]);

    ngOnInit(): void {
        this.dataSubscription = this.clipboardService.sharedData$.subscribe(data => {
            if (data.type !== 'text') {
                this.images.update(v => [...v, data.content]);
            }
        });
    }

    ngOnDestroy(): void {
        console.log('run on destroy');
        this.dataSubscription.unsubscribe();
    }
    
    deleteImage(imageToDelete: string) {
        // Filter the current array to remove the image to be deleted
        this.images.update(currentImages => currentImages.filter(img => img !== imageToDelete));
    }
}
