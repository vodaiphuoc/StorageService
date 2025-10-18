import { Routes } from '@angular/router';

import { Home } from './home/home';
import { About } from './about/about';
import { Dashboard } from './dashboard/dashboard';
import { authenGuard } from './core/guards/authen-guard';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'about',
        component: About,
    },
    {
        path: 'dashboard',
        component: Dashboard,
        // canActivate: [authenGuard]
    }

];