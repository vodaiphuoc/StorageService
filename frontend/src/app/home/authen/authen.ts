import { Component, model } from '@angular/core';

import { Login } from './components/login/login';
import { Register } from './components/register/register';

@Component({
  selector: 'app-authen',
  imports: [Login, Register],
  templateUrl: './authen.html',
  styleUrl: './authen.css'
})
export class Authen {
    shouldShowLogin = model<boolean>(true);

    setShowLoginFromChildComponents(newState: boolean) {
        this.shouldShowLogin.set(newState);
    }

}
