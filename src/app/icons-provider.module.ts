import { NgModule } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import {
  LockOutline,
  MinusOutline,
  PlusOutline,
  RetweetOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

const icons = [
  LockOutline,
  MinusOutline,
  PlusOutline,
  RetweetOutline,
  UserOutline,
];

@NgModule({
  imports: [NzIconModule.forChild(icons)],
  exports: [NzIconModule],
  providers: [],
})
export class IconsProviderModule {}
