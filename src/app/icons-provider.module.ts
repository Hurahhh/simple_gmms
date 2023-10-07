import { NgModule } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { UserOutline, LockOutline } from '@ant-design/icons-angular/icons';

const icons = [UserOutline, LockOutline];

@NgModule({
  imports: [NzIconModule.forChild(icons)],
  exports: [NzIconModule],
  providers: [],
})
export class IconsProviderModule {}
