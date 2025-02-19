import get from '../getService'
import URL from '../../Constants/apiUrls'

export default function dashboardOutstandingIssueList() {
  return new Promise((resolve, reject) => {
    var url = URL.outstandingIssueList

    get(url)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
