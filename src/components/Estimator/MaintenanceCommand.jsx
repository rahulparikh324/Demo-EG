import { useEffect, useState } from 'react'
import $ from 'jquery'
import getDomainName from '../../helpers/getDomainName'

const MaintenanceCommand = () => {
  const [embedUrl, setEmbedUrl] = useState()
  const [parameter, setParameter] = useState({
    access_token: localStorage.getItem('accessToken'),
    user_session_id: localStorage.getItem('userLoginSessionId'),
    domain: getDomainName(),
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
        const addQueryParam = `https://egalvanic.retool.com/embedded/public/80ef6636-e18d-4321-9ca3-cd5544c3d196?${createQueryString(parameter)}`
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

export default MaintenanceCommand
