import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isSpinning = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  submitForm(): void {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    } else {
      this.isSpinning = true;
      const formValue = this.form.value;
      signInWithEmailAndPassword(this.auth, formValue.email, formValue.password)
        .then((userCredential) => {
          this.router.navigate(['/']);
        })
        .catch((error) => {
          this.messageService.create('error', 'Đăng nhập thất bại!');
        })
        .finally(() => {
          this.isSpinning = false;
        });
    }
  }
}
