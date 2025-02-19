import _ from 'lodash'
import { getApplicationStorageItem } from './getStorageItem'

export default class getUserSitesData {
  constructor() {
    this.activeSite = getApplicationStorageItem('siteId')
  }
  getActiveSite = () => this.activeSite
  isActiveSiteAllSite = activeSite => {
    const allSiteID = JSON.parse(localStorage.getItem('loginData')).usersites.filter(site => site.status === 20)
    return activeSite === _.get(allSiteID, ['0', 'site_id'], undefined)
  }
}
