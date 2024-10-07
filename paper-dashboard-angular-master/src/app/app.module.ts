// import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
// import { NgModule } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { ToastrModule } from "ngx-toastr";

// import { SidebarModule } from './sidebar/sidebar.module';
// import { FooterModule } from './shared/footer/footer.module';
// import { NavbarModule } from './shared/navbar/navbar.module';
// import { FixedPluginModule } from './shared/fixedplugin/fixedplugin.module';

// import { AppComponent } from './app.component';
// import { AppRoutes } from './app.routing';

// import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// @NgModule({
//   declarations: [
//     AppComponent,
//     AdminLayoutComponent
//   ],
//   imports: [
//     BrowserAnimationsModule,
//     RouterModule.forRoot(AppRoutes, {
//       useHash: true
//     }),
//     SidebarModule,
//     NavbarModule,
//     ToastrModule.forRoot(),
//     FooterModule,
//     FixedPluginModule
//   ],
//   providers: [],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrModule } from "ngx-toastr";

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator'; // Optional if you plan to use pagination
import { MatButtonModule } from '@angular/material/button'; // For button elements
import { MatFormFieldModule } from '@angular/material/form-field'; // For form fields
import { MatInputModule } from '@angular/material/input'; // For input elements

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { FixedPluginModule } from './shared/fixedplugin/fixedplugin.module';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent
  ],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes, {
      useHash: true
    }),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    FooterModule,
    FixedPluginModule,

    // Import the Angular Material modules
    MatTableModule,         // For using mat-table
    MatSortModule,          // For sorting
    MatPaginatorModule,     // Optional: for pagination
    MatButtonModule,        // Optional: for buttons
    MatFormFieldModule,     // Optional: for form fields
    MatInputModule          // Optional: for input fields
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

