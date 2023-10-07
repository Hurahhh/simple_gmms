import { BillComponent } from './home/bill/bill.component';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../@core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { PagesComponent } from './pages.component';
import { PagesGuardService } from './pages-guard.service';
import { PaymentComponent } from './home/payment/payment.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    component: PagesComponent,
    canActivate: [PagesGuardService],
    children: [{ path: 'home', component: HomeComponent }],
  },
];

@NgModule({
  declarations: [
    BillComponent,
    HomeComponent,
    PagesComponent,
    PaymentComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzDropDownModule,
    NzGridModule,
    NzIconModule,
    NzLayoutModule,
    NzPipesModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class PagesModule {}
