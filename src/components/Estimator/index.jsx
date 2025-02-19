import React, { useEffect, useState } from 'react'
import $ from 'jquery'
import enums from 'Constants/enums'
import getFeaturewiseURL from 'Services/Dashboard/getFeaturewiseURL'
import getDomainName from '../../helpers/getDomainName'
import { getApplicationStorageItem } from '../../helpers/getStorageItem'

const Estimator = () => {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const [embedUrl, setEmbedUrl] = useState()
  const [parameter, setParameter] = useState({
    accessToken: localStorage.getItem('accessToken'),
    domain: getDomainName(),
    CompanyId: localStorage.getItem('companyId'),
    CompanyName: localStorage.getItem('companyName'),
    ClientCompanyId: getApplicationStorageItem('activeClientCompanyId'),
    ClientCompanyName: getApplicationStorageItem('clientCompanyName'),
    SiteId: getApplicationStorageItem('siteId'),
    SiteName: getApplicationStorageItem('siteName'),
    UserFullName: `${loginData.firstname} ${loginData.lastname}`,
  })

  const createQueryString = params => {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const response = await getFeaturewiseURL(enums.DASHBOARD.FEATURE_WISE.ESTIMATOR)
        const addQueryParam = `${response.data.data.url}?${createQueryString(parameter)}`
        setEmbedUrl(addQueryParam)
        $('#pageLoading').hide()
      } catch (error) {
        $('#pageLoading').hide()
        console.log(error)
      }
    })()
  }, [])

  return <iframe src={embedUrl} title='description' style={{ height: '93vh', width: '100%' }}></iframe>
}

export default Estimator
