import { AuthComponent } from './auth.component';
import { AuthGuardService } from './auth-guard.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    component: AuthComponent,
    canActivate: [AuthGuardService],
    children: [{ path: 'login', component: LoginComponent }],
  },
];

@NgModule({
  declarations: [AuthComponent, LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    NzLayoutModule,
    NzMessageModule,
    NzSpinModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers: [],
  exports: [AuthComponent],
})
export class AuthModule {}
