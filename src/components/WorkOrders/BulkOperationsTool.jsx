import { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import $ from 'jquery'
import getDomainName from 'helpers/getDomainName'

const BulkOperationsTool = ({ open, onClose, woId }) => {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const siteId = sessionStorage.getItem('siteId')
  const selectedSiteId = localStorage.getItem('selectedSiteId')
  const [embedUrl, setEmbedUrl] = useState()
  const [parameter, setParameter] = useState({
    domain: getDomainName(),
    accessToken: localStorage.getItem('accessToken'),
    site_id: selectedSiteId != null && selectedSiteId != undefined ? selectedSiteId : siteId !== null ? siteId : localStorage.getItem('siteId'),
    wo_id: woId,
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
        const addQueryParam = `https://egalvanic.retool.com/embedded/public/4ddd2729-7e34-47a7-be49-4e4ef94f311c?${createQueryString(parameter)}`
        setEmbedUrl(addQueryParam)
        $('#pageLoading').hide()
      } catch (error) {
        $('#pageLoading').hide()
        console.log(error)
      }
    })()
  }, [])

  return (
    <Drawer anchor='bottom' open={open} onClose={onClose} style={{ width: '100%' }}>
      <div style={{ background: '#7A7A7A' }}>
        <FormTitle
          title={
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '2px 0' }}>
              <span>Bulk Operations Tool</span>
              <span style={{ marginLeft: '2px', fontSize: '10px' }}>(Beta)</span>
            </span>
          }
          closeFunc={onClose}
          style={{ width: '100%', height: '50px', borderRadius: '30px 30px 0 0' }}
        />
      </div>
      <div style={{ padding: '10px', height: 'calc(90vh + 35px)', width: '100%', background: '#fff' }}>
        <iframe src={embedUrl} title='description' style={{ height: '100%', width: '100%' }}></iframe>
      </div>
    </Drawer>
  )
}

export default BulkOperationsTool
