import React from 'react'

import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined'

import awsLoginAction from 'Actions/awsLoginAction'
import Title from './TitleComponent'
import getCompanyLogos from 'Services/get-company-logo'

import { MinimalButton } from 'components/common/buttons'
import { MinimalInput } from 'components/Assets/components'

import getDomainName from 'helpers/getDomainName'
import getLogoName from 'helpers/getLogoName'
import { validateSchema } from 'helpers/schemaValidation'

import Amplify from 'aws-amplify'
import Cryptr from 'cryptr'
import * as yup from 'yup'
import { Toast } from 'Snackbar/useToast'
import { MainContext } from './Main/provider'
import { history } from '../helpers/history'
import enums from 'Constants/enums'

const cryptr = new Cryptr('myTotalySecretKey')

Amplify.configure({
  Auth: {
    identityPoolId: 'us-west-2:abc5d517-dc69-4eb8-a987-b7782a1ae827',
    region: 'us-west-2',
    userPoolId: 'us-west-2_M62HIBlMk',
    userPoolWebClientId: '23ftgt41k89qq43jj9q61tun8b',
  },
})

class Generallogin extends React.Component {
  static contextType = MainContext

  constructor() {
    super()
    this.state = {
      userName: '',
      password: '',
      errors: {},
      isLoading: false,
      companyCode: '',
      logo: {},
      logoDim: {},
      isShowPassword: false,
    }
    this.nameLogo = getLogoName()
  }

  getMeta = url =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = err => reject(err)
      img.src = url
    })

  async componentDidMount() {
    localStorage.clear()
    sessionStorage.clear()
    this.context.setMFAUser(null)
    document.title = this.nameLogo.title
    const companyCode = getDomainName()
    localStorage.setItem('domainName', companyCode)
    this.setState({ companyCode })

    window.history.pushState(null, null, window.location.href)
    window.history.go(1)

    try {
      const res = await getCompanyLogos({ id: companyCode })
      if (res.success) {
        this.setState({ logo: { main: res.data.company_logo, favicon: res.data.company_favicon_logo } })
        localStorage.setItem('main-logo', encodeURI(res.data.company_logo))
        localStorage.setItem('header-logo', encodeURI(res.data.company_thumbnail_logo))
        localStorage.setItem('favicon-logo', encodeURI(res.data.company_favicon_logo))
        localStorage.setItem('base64-logo', res.data.company_logo_base64)

        const img = await this.getMeta(res.data.company_logo)
        this.setState({ logoDim: { width: img.naturalWidth, height: img.naturalHeight } })
        localStorage.setItem('logo-aspect-ratio', img.naturalWidth / img.naturalHeight)
      }
    } catch (error) {
      console.log(error)
    }
  }

  loginBtnClick = e => {
    this.setState({ isLoading: true })
    const requestData = { username: this.state.userName.trim(), password: null, notification_token: localStorage.getItem('fcmToken'), os: 'web' }
    awsLoginAction(this.state.userName.trim(), this.state.password, this.state.companyCode, requestData)
      .then(awsLoginResponse => {
        const loginRequestData = { username: this.state.userName, password: this.state.password }
        loginRequestData.password = cryptr.encrypt(loginRequestData.password)
        if (awsLoginResponse.mfaRequired) {
          requestData.password = this.state.password
          this.context.setMFAUser({ loginData: awsLoginResponse.data, requestData: requestData, cognitoMfaTimer: awsLoginResponse.cognitoMfaTimer })
          Toast.success(enums.resMessages.msg_otp)
          history.push('/authentication')
        } else if (awsLoginResponse) {
          this.setState({ isLoading: false })
          const APP_URL = window.location.hostname.split('.')[0] === 'localhost' ? `http://localhost:3005/home/` : ['127', '192'].includes(window.location.hostname.split('.')[0]) ? `https://${window.location.hostname}:3005/home/` : `https://${window.location.hostname}/home/`
          window.location.replace(`${APP_URL + localStorage.getItem('accessToken')}/${cryptr.encrypt(loginRequestData.username.toLowerCase().trim())}/${loginRequestData.password.toLowerCase().trim()}`)
        }
      })
      .catch(err => {
        this.setState({ isLoading: false })
        if (err) Toast.error(err.tostMsg.msg)
      })
  }

  formValidation = async e => {
    e.preventDefault()
    const schema = yup.object().shape({
      userName: yup.string().required('Username is required !'),
      password: yup.string().required('Password is required !'),
    })
    const payload = {
      userName: this.state.userName,
      password: this.state.password,
    }
    const isValid = await validateSchema(payload, schema)
    this.setState({ errors: isValid })
    if (isValid === true) this.loginBtnClick()
  }

  render() {
    return (
      <div>
        <Title favicon={this.state.logo.favicon} />
        <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
          <CssBaseline />
          <div className='d-flex justify-content-center align-items-center flex-column'>
            <img alt='eG logo' src={this.state.logo.main} style={{ maxHeight: '100px' }} className='MuiAvatar-img' />
            <h4 className='text-bold my-2'>{this.nameLogo.name}</h4>
            <form style={{ width: '100%' }} onSubmit={this.formValidation} autoComplete='off'>
              <MinimalInput onFocus={() => this.setState({ errors: { ...this.state.errors, userName: null } })} error={this.state.errors.userName} placeholder='Enter Email' value={this.state.userName} onChange={e => this.setState({ userName: e })} label='Email Address' w={99} />

              <MinimalInput
                type={this.state.isShowPassword ? 'text' : 'password'}
                onFocus={() => this.setState({ errors: { ...this.state.errors, password: null } })}
                error={this.state.errors.password}
                placeholder='Password'
                value={this.state.password}
                onChange={e => this.setState({ password: e })}
                label='Password'
                w={99}
                hasSuffix
                suffix={
                  this.state.isShowPassword ? (
                    <VisibilityOutlinedIcon fontSize='small' style={{ cursor: 'pointer' }} onClick={() => this.setState({ isShowPassword: !this.state.isShowPassword })} />
                  ) : (
                    <VisibilityOffOutlinedIcon fontSize='small' style={{ cursor: 'pointer' }} onClick={() => this.setState({ isShowPassword: !this.state.isShowPassword })} />
                  )
                }
              />

              <MinimalButton loading={this.state.isLoading} disabled={this.state.isLoading} type='submit' loadingText='SIGNING IN...' text='SIGN IN' fullWidth variant='contained' color='primary' baseClassName='mt-2 mb-2' />
              <div className='for_psw' style={{ textAlign: 'right' }}>
                <a href='/forgotpassword'>Forgot password?</a>
              </div>
            </form>
          </div>
        </Container>
      </div>
    )
  }
}

export default Generallogin
