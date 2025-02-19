const stringValidation = (val, label) => {
  //if (!val) return { error: false, msg: '' }
  if (val.length === 0) return { error: true, msg: `${label} is required !` }
  else return { error: false, msg: '' }
}
const emailValidation = (val, label) => {
  if (!val) return { error: false, msg: '' }
  const emailValid = val.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
  if (val.length === 0) return { error: true, msg: `${label} is required !` }
  if (val.length !== 0 && !emailValid) return { error: true, msg: `${label} is invalid !` }
  return { error: false, msg: '' }
}

export const formValidation = (firstName, lastName, userName, email, status, role, defaultRole, company, site, defaultSite, language) => {
  const errorObject = {}
  errorObject['firstName'] = stringValidation(firstName, 'First Name')
  errorObject['lastName'] = stringValidation(lastName, 'Last Name')
  errorObject['userName'] = stringValidation(userName, 'User Name')
  errorObject['email'] = emailValidation(email, 'Email')
  errorObject['status'] = stringValidation(status, 'Status')
  errorObject['role'] = stringValidation(role, 'Role')
  errorObject['defaultRole'] = stringValidation(defaultRole, 'Default Role')
  errorObject['company'] = stringValidation(company, 'Company')
  errorObject['site'] = stringValidation(site, 'Site')
  errorObject['defaultSite'] = stringValidation(defaultSite, 'Default Site')
  errorObject['language'] = stringValidation(language, 'Language')
  if (!errorObject.firstName.error && !errorObject.language.error && !errorObject.defaultSite.error && !errorObject.site.error && !errorObject.lastName.error && !errorObject.company.error && !errorObject.userName.error && !errorObject.email.error && !errorObject.status.error && !errorObject.role.error && !errorObject.defaultRole.error)
    return { isValid: true, errorObject }
  return { isValid: false, errorObject }
}

export const errorObject = {
  firstName: { error: false, msg: '' },
  lastName: { error: false, msg: '' },
  userName: { error: false, msg: '' },
  email: { error: false, msg: '' },
  status: { error: false, msg: '' },
  role: { error: false, msg: '' },
  defaultRole: { error: false, msg: '' },
  company: { error: false, msg: '' },
  site: { error: false, msg: '' },
  defaultSite: { error: false, msg: '' },
  language: { error: false, msg: '' },
}
