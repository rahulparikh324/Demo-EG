export default function isTokenValid() {
  const expireTokenDate = new Date(localStorage.getItem('expireAwsTokenDate'))
  const currentDate = new Date()
  return currentDate.getTime() > expireTokenDate.getTime()
}
