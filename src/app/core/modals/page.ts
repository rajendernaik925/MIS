export interface IPageInfo {
  count: number;
  page: number;
  limit: number;
  page_count: number;
  next_page: boolean;
  prev_page: boolean;

  // ✅ add these
  startIndex: number;
  endIndex: number;
}


