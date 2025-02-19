export const handleNewRole = role => {
  if (role === 'Manager') return 'Project Manager'
  else if (role === 'Executive') return 'Client'
  else if (role === 'Company Admin') return 'Admin'
  else return role
}
