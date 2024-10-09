import { UserType } from '@share-package/common';

export const compareType = (type: string) => {
  const compare =
    type === UserType.Customer
      ? UserType.Customer
      : type === UserType.Employee
      ? UserType.Employee
      : UserType.Manager;
  return compare;
};
