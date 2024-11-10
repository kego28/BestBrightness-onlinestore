import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminCustemerOrdersPageRoutingModule } from './admin-custemer-orders-routing.module';

import { AdminCustemerOrdersPage } from './admin-custemer-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminCustemerOrdersPageRoutingModule
  ],
  declarations: [AdminCustemerOrdersPage]
})
export class AdminCustemerOrdersPageModule {}
