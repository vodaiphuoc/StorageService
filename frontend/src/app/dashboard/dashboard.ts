import { Component, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
import { Upload } from '@app/upload/upload';
import { SideNav } from '@app/side-nav/side-nav';
import { Search } from '@app/search/search';
import { UserAssets } from '@app/user-assets/user-assets';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-dashboard',
    imports: [Upload, SideNav, Search, UserAssets],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard {
    // isBrowser = false;
    constructor(
        // @Inject(PLATFORM_ID) platformId: Object,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        // this.isBrowser = isPlatformBrowser(platformId);
        // console.log('in AppFeature: ', this.isBrowser);

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
        ).addSvgIcon(
            'node-right-arrow-icon',
            this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/node-nav/caret-right.svg')
        );
    }
}
