import { Component, type OnInit, signal } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { type FileModelResponse } from '@clone-google-drive/commons';

@Component({
    selector: 'app-view-folder',
    imports: [MatTableModule, MatIconModule],
    templateUrl: './view-folder.html',
    styleUrl: './view-folder.css'
})
export class ViewFolder {
    itemList = signal<FileModelResponse[]>([]);
    displayedColumns: string[] = ['fileName', 'createAt'];
    
}
