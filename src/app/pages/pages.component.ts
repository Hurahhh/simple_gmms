import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

import { CommonUtil } from '../@core/utils/common.util';

import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-page',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit {
  isCollapsed = false;
  userName: string | null | undefined = '';

  constructor(
    private messageService: NzMessageService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.currentUser?.email ?? '';
  }

  onLogout() {
    signOut(this.auth)
      .then(() => {
        this.router.navigate(['/auth/login']);
      })
      .catch((error) => {
        this.messageService.create('error', CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }
}
