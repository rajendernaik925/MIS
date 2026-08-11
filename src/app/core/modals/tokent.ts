export interface IPermission {
  module_id: number;
  module_name: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

export interface IEmployeeData {
  employeeId: number;
  roleId: number;
  roleName: string;
  employeeName: string;
  departmentName: string;
  designationName: string;
  businessunitName: string;
}

export interface IEmployeeAccess {
  employeeData: IEmployeeData;
  moduleAccess: IPermission[];
}

// Raw shape returned by the /login endpoint
export interface ILoginResponse {
  employeeId: number;
  roleId: number;
  roleName: string;
  employeeName: string;
  departmentName: string;
  designationName: string;
  businessunitName: string;
  permissions: IPermission[];
  token: string;
  message: string;
  expirationTime: string;
  expiresIn: number;
}