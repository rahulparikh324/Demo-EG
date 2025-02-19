import enums from '../Constants/enums'

export default class getUserRole {
  constructor() {
    this.roleName = sessionStorage.getItem('roleName') !== null ? sessionStorage.getItem('roleName') : localStorage.getItem('roleName')
    this.userRoles = JSON.parse(localStorage.getItem('__userRoles'))
  }
  isManager = () => this.roleName === enums.userRoles[0].role
  isSuperAdmin = () => this.roleName === enums.userRoles[1].role
  isOperator = () => this.roleName === enums.userRoles[2].role
  isMaintenanceStaff = () => this.roleName === enums.userRoles[3].role
  isExecutive = () => this.roleName === enums.userRoles[4].role
  isCompanyAdmin = () => this.roleName === enums.userRoles[5].role
  currentSelectedRole = roleID => {
    const __role = this.userRoles.find(role => role.role_id === roleID) || {}
    if (!__role) __role.role_name = ''
    return {
      isManager: () => __role.role_name === enums.userRoles[0].role,
      isSuperAdmin: () => __role.role_name === enums.userRoles[1].role,
      isOperator: () => __role.role_name === enums.userRoles[2].role,
      isMaintenanceStaff: () => __role.role_name === enums.userRoles[3].role,
      isExecutive: () => __role.role_name === enums.userRoles[4].role,
      isCompanyAdmin: () => __role.role_name === enums.userRoles[5].role,
    }
  }
}
