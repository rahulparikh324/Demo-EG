import React, { useEffect } from 'react'
import { embedDashboard } from 'amazon-quicksight-embedding-sdk'
import * as AWS from 'aws-sdk'
import $ from 'jquery'
import getQuickSightEmbedURL from 'Services/Dashboard/getQuickSightEmbedURL'
import enums from 'Constants/enums'

const AssetOverview = () => {
  AWS.config.update({ region: 'us-east-2' })
  const loginData = JSON.parse(localStorage.getItem('loginData'))

  useEffect(() => {
    $('#pageLoading').show()
    console.log({ companyId: loginData.usersites[0].company_id })
    ;(async () => {
      try {
        const response = await getQuickSightEmbedURL(enums.DASHBOARD.ASSET_OVERVIEW)
        const embedUrl = response.data.data
        const options = {
          url: embedUrl,
          container: '#embeddingContainer',
          parameters: { companyId: loginData.usersites[0].company_id },
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

export default AssetOverview
