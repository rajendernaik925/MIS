export interface IAuthResponse {
  jwtToken: string;
  employeeAccess: IEmployeeAccess;
}

export interface IEmployeeAccess {
  employeeData: {
    id: string;
    name: string;
    buId: string;
    buName: string;
    dept: string;
    desg: string;
  };
  moduleAccess: {
    moduleId: number;
    moduleName: string;
    displayInUi: boolean;
    canWrite: boolean;
  }[];
}


