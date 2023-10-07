import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IconsProviderModule } from './icons-provider.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { registerLocaleData } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { vi_VN } from 'ng-zorro-antd/i18n';
import vi from '@angular/common/locales/vi';

registerLocaleData(vi);

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IconsProviderModule,
    NoopAnimationsModule,
    provideAuth(() => getAuth()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    RouterModule.forRoot(routes),
  ],
  providers: [{ provide: NZ_I18N, useValue: vi_VN }],
  bootstrap: [AppComponent],
})
export class AppModule {}
