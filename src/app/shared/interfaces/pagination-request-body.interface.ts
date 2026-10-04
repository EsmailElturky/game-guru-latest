export interface IPaginationRequestBody {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface IPaginationResponse<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
