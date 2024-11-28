import _ from 'lodash';
export const calcSalePrice = (costPrice: number, discount: number) => {
  if (discount === 0 || discount === null || discount === undefined) {
    return _.round(costPrice + costPrice * 0.9);
  }
  return _.round(costPrice + costPrice * 0.9 - costPrice * (discount / 100));
};
