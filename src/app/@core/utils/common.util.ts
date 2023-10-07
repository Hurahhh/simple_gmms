import { Timestamp } from 'firebase/firestore';

export class CommonUtil {
  static COMMON_ERROR_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại sau!';

  /**
   *
   * @param d Date parts
   * @param t Time parts
   * @returns Combine date and time
   */
  static combineDateTime(d: Date, t: Date) {
    const date = new Date();
    date.setFullYear(d.getFullYear());
    date.setMonth(d.getMonth());
    date.setDate(d.getDate());
    date.setHours(t.getHours());
    date.setMinutes(t.getMinutes());
    date.setSeconds(t.getSeconds());
    date.setMilliseconds(t.getMilliseconds());

    return date;
  }

  static startOfDate(d: Date) {
    const date = new Date();
    date.setFullYear(d.getFullYear());
    date.setMonth(d.getMonth());
    date.setDate(d.getDate());
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  static endOfDate(d: Date) {
    const date = new Date();
    date.setFullYear(d.getFullYear());
    date.setMonth(d.getMonth());
    date.setDate(d.getDate());
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);

    return date;
  }

  /**
   *
   * @returns Min UTC timestamp
   */
  static getMinTs() {
    return Timestamp.fromDate(new Date('0001-01-01T00:00:00.00Z'));
  }

  /**
   *
   * @returns Max UTC timestamp
   */
  static getMaxTs() {
    return Timestamp.fromDate(new Date('9999-12-31T23:59:59.99Z'));
  }

  static arrayDistinct<T>(arr: T[], key: string) {
    //@ts-ignore
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  }
}
