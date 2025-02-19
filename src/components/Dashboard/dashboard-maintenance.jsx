import React, { useContext, useEffect } from 'react'
import { embedDashboard } from 'amazon-quicksight-embedding-sdk'
import * as AWS from 'aws-sdk'
import $ from 'jquery'
import getQuickSightEmbedURL from 'Services/Dashboard/getQuickSightEmbedURL'
import getUserRole from 'helpers/getUserRole'
import getUserSitesData from 'helpers/getUserSitesData'
import enums from 'Constants/enums'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const DashboardMaintenance = () => {
  AWS.config.update({ region: 'us-east-2' })
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const checkUserRole = new getUserRole()
  const userSitesData = new getUserSitesData()
  const getParameters = () => {
    const siteId = []
    const companyId = loginData.usersites?.[0]?.company_id ?? null
    const clientCompanyId = getApplicationStorageItem('activeClientCompanyId')
    if (checkUserRole.isCompanyAdmin() || checkUserRole.isManager()) {
      const active = userSitesData.getActiveSite()
      if (userSitesData.isActiveSiteAllSite(active)) loginData.usersites.forEach(({ site_id, status }) => status !== 20 && siteId.push(site_id))
      else siteId.push(getApplicationStorageItem('siteId'))
    } else loginData.usersites.forEach(({ site_id, status }) => status !== 20 && siteId.push(site_id))

    return { siteId, companyId, clientCompanyId }
  }

  useEffect(() => {
    $('#pageLoading').show()
    console.log(getParameters())
    ;(async () => {
      try {
        const response = await getQuickSightEmbedURL(enums.DASHBOARD.PM)
        const embedUrl = response.data.data
        const options = {
          url: embedUrl,
          container: '#embeddingContainer',
          parameters: getParameters(),
          scrolling: 'no',
          locale: 'en-US',
          footerPaddingEnabled: true,
        }
        $('#pageLoading').hide()
        const dashboard = embedDashboard(options)
        dashboard.on('error', () => $('#pageLoading').hide())
        dashboard.on('load', () => $('#pageLoading').hide())
      } catch (error) {
        $('#pageLoading').hide()
        console.log(error)
      }
    })()
  }, [])

  return <div id='embeddingContainer' style={{ height: '93vh' }}></div>
}

export default DashboardMaintenance
