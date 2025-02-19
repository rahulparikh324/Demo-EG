import React from 'react'
import Helmet from 'react-helmet'
import getLogoName from '../helpers/getLogoName'

const Title = ({ title, favicon }) => {
  const nameLogo = getLogoName()
  var defaultTitle = nameLogo.title
  var newTitle = `${nameLogo.title} | ` + title
  const faviconIcon = localStorage.getItem('favicon-logo') || favicon
  return (
    <Helmet>
      <link rel='icon' id='favicon' type='image/png' href={faviconIcon} sizes='16x16' />
      <title>{title ? newTitle : defaultTitle}</title>
    </Helmet>
  )
}

export default Title
