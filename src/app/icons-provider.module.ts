import { NgModule } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import {
  LockOutline,
  PlusOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

const icons = [LockOutline, PlusOutline, UserOutline];

@NgModule({
  imports: [NzIconModule.forChild(icons)],
  exports: [NzIconModule],
  providers: [],
})
export class IconsProviderModule {}
