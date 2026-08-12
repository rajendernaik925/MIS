export const projectName = 'MIS Project';
const authUrl = '/auth';
const constantMasterUrl = '/master';
const constantDashboardUrl = '/dashboard';
const constantPayableUrl = '/payable-summary';
const constantjoinAndExitUrl = '/join-exit';

export const authUrls = {
  login: `${authUrl}/login`,
};

export const masterUrls = {
  locations: `${constantMasterUrl}/locations`,
  payPeriod: `${constantMasterUrl}/payperiod`,
};

export const dashboardUrls = {
  summary: `${constantDashboardUrl}/summary`,
}

export const payableUrls = {
  paybleList: `${constantPayableUrl}/fetch-summary`,
  exportExcel: `${constantPayableUrl}/export-excel`,
};

export const joinAndExitUrls = {
  joinAndExitList: `${constantjoinAndExitUrl}/fetch-summary`,
}