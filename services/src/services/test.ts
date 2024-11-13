import _ from 'lodash';
const servicesInPackageIds = [
  '672a315efcf9569332f4e128',
  '672a315efcf9569332f4e12b',
];
const serviceIds = [
  '672a315efcf9569332f4e128',
  // '672a315efcf9569332f4e12b',
  // '672a315efcf9569332f4e13d',
];
const addIds = _.difference(serviceIds, servicesInPackageIds);
const deleteIds = _.difference(servicesInPackageIds, serviceIds);
console.log(addIds);
console.log(deleteIds);
