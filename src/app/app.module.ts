import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy, ModalController } from '@ionic/angular';
import { MenuController} from '@ionic/angular';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

// import { AuthFormComponent } from './auth-form/auth-form.component';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { CategoryManagementComponent } from './category-management/category-management.component';
import { PromotionManagementComponent } from './promotion-management/promotion-management.component';
import { ChartDataService } from './services/chart-data.service';
import { SalesChartComponent } from './sales-chart/sales-chart.component';
@NgModule({
  
  declarations: [AppComponent, NavbarComponent, CategoryManagementComponent, PromotionManagementComponent,SalesChartComponent],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    ZXingScannerModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },ChartDataService,
    MenuController,
    ModalController
    
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}