import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined'
import $ from 'jquery'

import { history } from 'helpers/history'
import GetAwsAuthCredetial from 'Actions/GetAwsAuthCredetialAction'
import Amplify, { Auth } from 'aws-amplify'
import Title from './TitleComponent'

import { MinimalButton } from 'components/common/buttons'
import { MinimalInput } from 'components/Assets/components'
import { Toast } from 'Snackbar/useToast'

import { validateSchema } from 'helpers/schemaValidation'
import getLogoName from 'helpers/getLogoName'
import getDomainName from 'helpers/getDomainName'
import * as yup from 'yup'
import getCompanyLogos from 'Services/get-company-logo'

class SetNewPasswordComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      isLoading: false,
      errors: {},
      companyCode: '',
      logo: {},
      logoDim: {},
      isShowPassword: false,
      isShowConfirmPassword: false,
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
    const companyCode = getDomainName()
    document.title = this.nameLogo.title
    localStorage.setItem('domainName', companyCode)
    this.setState({ companyCode })
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

  confirmBtnClick = () => {
    this.setState({ isLoading: true })
    const verificationCode = this.props.match.params.code
    GetAwsAuthCredetial(this.state.companyCode)
      .then(authcredetilas => {
        Amplify.configure({ Auth: authcredetilas })
        Auth.forgotPasswordSubmit(this.state.email.trim(), verificationCode.trim(), this.state.password)
          .then(data => {
            this.setState({ isLoading: false })
            Toast.success('Password updated successfully !')
            setTimeout(() => history.push('/login'), 1000)
          })
          .catch(err => {
            console.log(err)
            const message = err.code === 'ExpiredCodeException' ? 'Provided link expired, Please try again !' : 'Something went wrong !'
            this.setState({ isLoading: false })
            Toast.error(message)
          })
      })
      .catch(error => Toast.error('Something went wrong !'))
  }

  formValidation = async e => {
    e.preventDefault()
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,99}$/
    const schema = yup.object().shape({
      email: yup
        .string()
        .required('Email is required !')
        .matches(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i, 'Enter a valid Email !'),
      password: yup.string().required('Password is required !').min(6, 'Password must be atleast of 6 characters').matches(regex, 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@, $, !, %, *, ?, &)'),
      confirmPassword: yup
        .string()
        .required('Confirm Password is required !')
        .oneOf([yup.ref('password')], 'Your passwords do not match.'),
    })
    const payload = {
      email: this.state.email,
      password: this.state.password,
      confirmPassword: this.state.confirmPassword,
    }
    const isValid = await validateSchema(payload, schema)
    this.setState({ errors: isValid })
    if (isValid === true) this.confirmBtnClick()
  }

  render() {
    return (
      <div>
        <Title />
        <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
          <CssBaseline />
          <div className='d-flex justify-content-center align-items-center flex-column'>
            <img alt='eG logo' src={this.state.logo.main} style={{ maxHeight: '100px' }} className='MuiAvatar-img' />
            <h4 className='text-bold my-2'>Reset Password</h4>
            <form style={{ width: '100%' }} onSubmit={this.formValidation}>
              <MinimalInput onFocus={() => this.setState({ errors: { email: null } })} error={this.state.errors.email} placeholder='Enter Email' value={this.state.email} onChange={e => this.setState({ email: e })} label='Email Address' w={99} />
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
              <MinimalInput
                type={this.state.isShowConfirmPassword ? 'text' : 'password'}
                onFocus={() => this.setState({ errors: { ...this.state.errors, confirmPassword: null } })}
                error={this.state.errors.confirmPassword}
                placeholder='Confirm Password'
                value={this.state.confirmPassword}
                onChange={e => this.setState({ confirmPassword: e })}
                label='Confirm Password'
                w={99}
                hasSuffix
                suffix={
                  this.state.isShowConfirmPassword ? (
                    <VisibilityOutlinedIcon fontSize='small' style={{ cursor: 'pointer' }} onClick={() => this.setState({ isShowConfirmPassword: !this.state.isShowConfirmPassword })} />
                  ) : (
                    <VisibilityOffOutlinedIcon fontSize='small' style={{ cursor: 'pointer' }} onClick={() => this.setState({ isShowConfirmPassword: !this.state.isShowConfirmPassword })} />
                  )
                }
              />
              <MinimalButton loading={this.state.isLoading} loadingText='SETTING PASSWORD...' type='submit' text='SUBMIT' fullWidth variant='contained' color='primary' baseClassName='mt-2 mb-2' disabled={this.state.password.length === 0 || this.state.confirmPassword.length === 0 || this.state.isLoading} />
            </form>
          </div>
        </Container>
      </div>
    )
  }
}

export default SetNewPasswordComponent
