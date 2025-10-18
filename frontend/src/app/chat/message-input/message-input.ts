import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FileUploadIndicator } from './components/file-upload-indicator/file-upload-indicator';
import { AddFiles } from './components/add-files/add-files';
import { ClipboardService } from './services/clipboard/clipboard';

@Component({
    selector: 'app-message-input',
    imports: [FormsModule, FileUploadIndicator,AddFiles],
    templateUrl: './message-input.html',
    styleUrl: './message-input.css',
    providers: [ClipboardService]
})
export class MessageInput implements OnInit, OnDestroy {

    private clipboardService: ClipboardService = inject(ClipboardService);

    private currentTextSubscription!: Subscription;

    currentText = signal<string>('');

    ngOnInit(): void {
        this.currentTextSubscription = this.clipboardService.sharedData$.subscribe(data => {
            if (data.type === 'text') {
                this.currentText.update(v => v + data.content);
            }
        });
    }

    ngOnDestroy(): void {
        this.currentTextSubscription.unsubscribe();
    }

    handleClipboardData(event: ClipboardEvent): void {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        const clipboardItems = event.clipboardData?.items;

        if (clipboardItems !== undefined && clipboardData !== null) {
            this.clipboardService.process(clipboardData, clipboardItems);
            
        } else {
            console.log('data null: ', clipboardData);
        }

    }
}
