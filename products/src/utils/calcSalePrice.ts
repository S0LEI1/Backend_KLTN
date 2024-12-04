export const calcSalePrice = (costPrice: number, discount: number | 0) => {
  if (discount === 0 || discount === null || discount === undefined) {
    return costPrice * 1.2;
  }
  return costPrice * 1.2 - costPrice * (discount / 100);
};
