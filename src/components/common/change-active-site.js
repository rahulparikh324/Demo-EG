import { isEmpty } from 'lodash'

export const changeActiveSite = siteId => {
  const logindata = JSON.parse(localStorage.getItem('loginData'))
  const { usersites, client_company } = logindata

  let sites = null
  if (!isEmpty(usersites)) {
    usersites.forEach(s => {
      const clientCompanyName = client_company.filter(d => d.client_company_id.includes(s.client_company_id))
      if (s.status !== 20 && s.site_id === siteId) {
        const companyData = { ...s, client_company_name: clientCompanyName[0]?.client_company_name }
        sites = { ...companyData }
      }
    })
  }

  if (sites) {
    localStorage.setItem('clientCompanyName', sites.client_company_name)
    localStorage.setItem('siteId', sites.site_id)
    localStorage.setItem('siteName', sites.site_name)
    localStorage.setItem('activeClientCompanyId', sites.client_company_id)

    sessionStorage.setItem('clientCompanyName', sites.client_company_name)
    sessionStorage.setItem('siteId', sites.site_id)
    sessionStorage.setItem('siteName', sites.site_name)
    sessionStorage.setItem('activeClientCompanyId', sites.client_company_id)
  }

  return sites
}
