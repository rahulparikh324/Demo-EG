import getDomainName from './getDomainName'

function getLogoName() {
  const hostname = getDomainName()
  const domain = 'egalvanic'
  const title = domain === 'egalvanic' ? 'Egalvanic' : 'Sensaii'
  const name = domain === 'egalvanic' ? 'Egalvanic' : 'Asset Care'
  const logoPath = localStorage.getItem('main-logo')
  const headerLogo = localStorage.getItem('header-logo')
  const favicon = localStorage.getItem('favicon-logo')
  return { name, logoPath, headerLogo, title, hostname, favicon }
}
export default getLogoName
