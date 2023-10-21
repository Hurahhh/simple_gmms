import {NgModule} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';

import {
  LockOutline,
  MinusOutline,
  PlusOutline,
  RetweetOutline,
  UserOutline,
  EditOutline,
} from '@ant-design/icons-angular/icons';

const icons = [
  LockOutline,
  MinusOutline,
  PlusOutline,
  RetweetOutline,
  UserOutline,
  EditOutline,
];

@NgModule({
  imports: [NzIconModule.forChild(icons)],
  exports: [NzIconModule],
  providers: [],
})
export class IconsProviderModule {}
