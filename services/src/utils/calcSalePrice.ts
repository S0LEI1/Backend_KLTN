export const calcSalePrice = (costPrice: number, discount: number) => {
  if (discount === 0 || discount === null || discount === undefined) {
    return costPrice + costPrice * 0.9;
  }
  return costPrice + costPrice * 0.9 - costPrice * (discount / 100);
};
