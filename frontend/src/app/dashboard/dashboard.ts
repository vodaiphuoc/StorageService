import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Upload } from '@app/upload/upload';
import { SideNav } from '@app/side-nav/side-nav';
import { Search } from '@app/search/search';
import { UserAssets } from '@app/user-assets/user-assets';

@Component({
    selector: 'app-dashboard',
    imports: [Upload, SideNav, Search, UserAssets],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard {
    isBrowser = false;
    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
        console.log('in AppFeature: ', this.isBrowser);
    }
}
