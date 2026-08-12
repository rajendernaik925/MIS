export const projectName = 'MIS Project';

export const authUrls = {
  login: '/auth/login',
};

export const masterUrls = {
  locations: '/master/locations',
  payPeriod: '/master/payperiod',
};

export const dashboardUrls = {
  summary: '/dashboard/summary',
}

export const payableUrls = {
  paybleList: '/payable-summary/fetch-summary',
  exportExcel: '/payable-summary/export-excel',
}


export const commonUrls = {
  indentFiles: '/common/files',
  indentDetails: '/common/indentdetails',
  processIndent: (module: string) => `/${module}/process-indent`,
  materialUpdate: (module: string) => `/${module}/material-update`,
  parentUpdate: (module: string) => `/${module}/indent-update`,
  removeMaterial: (module: string) => `/${module}/material-disable`,
  fileUpdate: (module: string) => `/${module}/file-update`,
  sendForCorrection: (module: string) => `/${module}/correction`,
  correctionDone: (module: string) => `/${module}/correct-indent`,
}


