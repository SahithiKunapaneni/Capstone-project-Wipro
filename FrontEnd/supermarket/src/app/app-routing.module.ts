import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { CheckoutComponent } from './checkout/checkout.component';

import { BillComponent } from './bill/bill.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CashierLayoutComponent } from './cashier-layout/cashier-layout.component';
import { OverviewComponent } from './overview/overview.component';


const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' }, 
  { path: 'add-product', component: ProductAddComponent },
  { path: 'product-list', component: ProductListComponent },
  { path: 'login', component: LoginComponent },
  {path:'checkout',component:CheckoutComponent},
  {path : 'sales-history',component: SalesHistoryComponent},
   {path: 'bill', component: BillComponent },
   {path :'dashboard',component:DashboardComponent},
   {path : 'users', component: UserManagementComponent},
   {path: 'adminlayout', component:AdminLayoutComponent},
   {path: 'cashier-layout', component:CashierLayoutComponent},
   {path : 'overview', component : OverviewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}