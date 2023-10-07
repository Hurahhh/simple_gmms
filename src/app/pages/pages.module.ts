import { CommonModule } from '@angular/common';
import { CoreModule } from '../@core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { PagesComponent } from './pages.component';
import { PagesGuardService } from './pages-guard.service';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
  {
    path: '',
    component: PagesComponent,
    canActivate: [PagesGuardService],
    children: [{ path: 'welcome', component: WelcomeComponent }],
  },
];

@NgModule({
  declarations: [WelcomeComponent, PagesComponent],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    NzAvatarModule,
    NzDropDownModule,
    NzLayoutModule,
    NzPipesModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class PagesModule {}
