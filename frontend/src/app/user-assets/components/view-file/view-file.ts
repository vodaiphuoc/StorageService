import { Component, input } from '@angular/core';
import { type SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-file',
  imports: [],
  templateUrl: './view-file.html',
  styleUrl: './view-file.css'
})
export class ViewFile {
    safeFileURL = input<SafeResourceUrl>('');
}
