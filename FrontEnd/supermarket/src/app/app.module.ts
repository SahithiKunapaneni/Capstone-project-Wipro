import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductService } from './product.service';
import { LoginComponent } from './login/login.component';
import { CheckoutComponent } from './checkout/checkout.component';

import { BillComponent } from './bill/bill.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CashierLayoutComponent } from './cashier-layout/cashier-layout.component';
import { OverviewComponent } from './overview/overview.component';


@NgModule({
  declarations: [
    AppComponent,
    ProductAddComponent,
    ProductListComponent,
    LoginComponent,
    CheckoutComponent,
    SalesHistoryComponent,
    BillComponent,
    DashboardComponent,
    UserManagementComponent,
    AdminLayoutComponent,
    CashierLayoutComponent,
    OverviewComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [ProductService],
  bootstrap: [AppComponent]
})
export class AppModule { }