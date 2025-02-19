function getDomainName() {
  const hostname = window.location.hostname.split('.')[0]
  const companyCode = ['localhost', '192', '127'].includes(hostname) ? 'democompany' : hostname
  return companyCode
}

export default getDomainName
