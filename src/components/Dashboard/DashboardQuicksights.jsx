import React, { useEffect } from 'react'
import { embedDashboard } from 'amazon-quicksight-embedding-sdk'
import * as AWS from 'aws-sdk'
import $ from 'jquery'
import getQuickSightEmbedURL from '../../Services/Dashboard/getQuickSightEmbedURL'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

function DashboardQuicksights() {
  AWS.config.update({ region: 'us-east-2' })
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const checkUserRole = new getUserRole()
  const userSitesData = new getUserSitesData()

  const getParameters = () => {
    const SiteID = []
    const CompanyID = loginData.usersites[0].company_id
    if (checkUserRole.isManager()) {
      const active = userSitesData.getActiveSite()
      if (userSitesData.isActiveSiteAllSite(active)) loginData.usersites.forEach(({ site_id, status }) => status !== 20 && SiteID.push(site_id))
      else SiteID.push(getApplicationStorageItem('siteId'))
    } else loginData.usersites.forEach(({ site_id, status }) => status !== 20 && SiteID.push(site_id))

    return { SiteID, CompanyID }
  }

  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const response = await getQuickSightEmbedURL()
        const embedUrl = response.data.data
        //console.log(embedUrl)
        const options = {
          url: embedUrl,
          container: '#embeddingContainer',
          parameters: getParameters(),
          scrolling: 'no',
          locale: 'en-US',
          footerPaddingEnabled: true,
        }
        //console.log(options)
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

export default DashboardQuicksights
