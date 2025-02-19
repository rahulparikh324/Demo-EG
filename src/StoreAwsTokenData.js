import moment from 'moment'
import Cryptr from 'cryptr'
const cryptr = new Cryptr('myTotalySecretKey')

export default function storeAwsTokenData() {
  return new Promise((resolve, reject) => {
    var url = window.location.href
    var urlSpiltData = url.split('/')

    var jwtToken = ''
    var username = ''
    var password = ''

    jwtToken = urlSpiltData[4]
    username = cryptr.decrypt(urlSpiltData[5])
    password = urlSpiltData[6]

    var currentDate = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    var expireTokenDate = moment(currentDate).add(55, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ')

    var loginRequestData = {
      username: username,
      password: password,
    }

    localStorage.setItem('accessToken', jwtToken)

    //localStorage.setItem('expireAwsTokenDate', expireTokenDate);

    resolve(loginRequestData)
  })
}
