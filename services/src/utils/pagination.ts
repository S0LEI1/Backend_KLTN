export class Pagination {
  static query() {
    const query: Record<string, any> = {};
    return query;
  }
  static options(pages: string, limit: string, sortBy: string) {
    const otps = {
      skip: parseInt(pages as string) - 1,
      limit: parseInt(limit as string, 10),
      sort: sortBy === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
    };
    return otps;
  }
}
