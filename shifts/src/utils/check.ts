import { ShiftOptions } from '@share-package/common';

export class Check {
  static checkOptions(option: string) {
    if (option === ShiftOptions.Morning) {
      return ShiftOptions.Morning;
    }
    if (option === ShiftOptions.Aftermoon) {
      return ShiftOptions.Aftermoon;
    }
    if (option === ShiftOptions.Evening) {
      return ShiftOptions.Evening;
    }
  }
}
