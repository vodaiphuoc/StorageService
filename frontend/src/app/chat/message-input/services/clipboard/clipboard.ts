import { Injectable, signal } from '@angular/core';
import { SupportFileTypes, ClipboardProcessingResult } from '../../../../core/models/message-types';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {
    private tempData: ClipboardProcessingResult = {type: "text", content: ""};

    private _sharedData = new BehaviorSubject<ClipboardProcessingResult>(this.tempData);
    public sharedData$: Observable<ClipboardProcessingResult> = this._sharedData.asObservable();

    process(
        clipboardData: DataTransfer,
        itemList: DataTransferItemList
    ): void {
        for (let i = 0; i < itemList.length; i++) {
            
            if (itemList[i].type === 'text/plain') {
                const newData: ClipboardProcessingResult = {
                    type: "text",
                    content: clipboardData.getData('text/plain')
                };
                this._sharedData.next(newData);
                
            } else if (itemList[i].type === "image/png") {
                const imageFile = itemList[i].getAsFile();
                
                if (imageFile) {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        const newData: ClipboardProcessingResult = {
                            type: "image",
                            content: e.target?.result as string
                        };
                        this._sharedData.next(newData);
                    };
                    reader.readAsDataURL(imageFile);
                    
    
                } else {
                    console.log('imageFile is null');
                }

            } else {
                console.log('not implement file type: ',itemList[i].type);
            }
        }
        console.log('process done');
    }
}
