import URL from 'Constants/apiUrls'
import api from 'Services/api-call'
import enums from 'Constants/enums'

const notification = {
  count: () => api(`${URL.notification.count}/${enums.NOTIFICATION.NEW}`),
  get: ({ list, pageIndex }) => api(`${URL.notification.get}/${list}/${pageIndex}`),
  updateNotificationStatus: payload => api(`${URL.notification.updateNotificationStatus}`, payload, true),
  markAllRead: () => api(`${URL.notification.markAllRead}/${enums.NOTIFICATION.READ}`),
}

export default notification
