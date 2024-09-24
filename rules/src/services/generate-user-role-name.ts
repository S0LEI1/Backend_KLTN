export class GenerateUserRoleName {
  static forrmat(type: string, id: string) {
    return `role-${type}-${id}`;
  }
}
