import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCustemerOrdersPage } from './admin-custemer-orders.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCustemerOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCustemerOrdersPageRoutingModule {}
