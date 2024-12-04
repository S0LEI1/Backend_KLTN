import _ from 'lodash';
export const calcSalePrice = (costPrice: number, discount: number) => {
  if (discount === 0 || discount === null || discount === undefined) {
    return _.round(costPrice * 1.2);
  }
  return _.round(costPrice * 1.2 - costPrice * (discount / 100));
};
