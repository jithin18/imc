import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/dashboard',     title: 'AIBot Dashboard',         icon:'nc-bank',       class: '' },
 
     
    { path: '/reports/ongoing-calls', title: 'Ongoing Calls', icon: 'nc-headphones', class: '' },
   { path: '/reports/call-history', title: 'Call History', icon: 'nc-single-copy-04', class: '' },
    // { path: '/maps',          title: 'Recordings',              icon:'nc-note-03',      class: '' },
    // { path: '/notifications', title: 'Agents Performance',     icon:'nc-chart-bar-32',    class: '' },
    // { path: '/user',          title: 'Users ',      icon:'nc-single-02',  class: '' },
    // { path: '/table',         title: 'Category',        icon:'nc-tile-56',    class: '' },
    // { path: '/typography',    title: 'Integrations',        icon:'nc-caps-small', class: '' },
    
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
