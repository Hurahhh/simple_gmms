import { PAYMENT_STATUS, TAG_COLOR } from '../constants/common.constant';
import { Pipe, PipeTransform } from '@angular/core';
import { Tag } from '../types/common.type';

@Pipe({ name: 'payment_status' })
export class PaymentStatusPipe implements PipeTransform {
  transform(value: number) {
    let tag = {
      text: 'unknown',
      color: TAG_COLOR.DEFAULT,
    } as Tag;
    switch (value) {
      case PAYMENT_STATUS.CREATED:
        tag.text = 'Đã tạo';
        tag.color = TAG_COLOR.GREEN;
        break;

      case PAYMENT_STATUS.SETTLED:
        tag.text = 'Đã quyết toán';
        tag.color = TAG_COLOR.PURPLE;
        break;

      case PAYMENT_STATUS.DUPPLICATE_SETTLED:
        tag.text = 'Quyết toán lặp';
        tag.color = TAG_COLOR.RED;
        break;

      default:
        break;
    }
    return tag;
  }
}
