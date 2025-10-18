import { Component, ViewChild, ElementRef } from '@angular/core';
import {RouterLink} from '@angular/router';

import { Authen } from './authen/authen';

@Component({
    selector: 'app-home',
    imports: [RouterLink, Authen],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class Home {
    showLogin: boolean = true;

    @ViewChild('authenContainer', { read: ElementRef }) authenContainer!: ElementRef;

    scrollToElement(element: HTMLElement, duration: number = 900) {
        const start = window.scrollY;
        const end = element.getBoundingClientRect().top + window.scrollY;
        const distance = end - start;
        let startTime: number | null = null;
      
        const step = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
      
          // ease in-out
          const easing = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
      
          window.scrollTo(0, start + distance * easing);
      
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
      
        requestAnimationFrame(step);
      }
      

    setAuthenState(isLogin: boolean) {
        this.showLogin = isLogin;
        this.scrollToElement(this.authenContainer.nativeElement);
        
    }
}
