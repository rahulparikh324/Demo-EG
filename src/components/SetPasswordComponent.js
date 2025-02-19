import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined'

import setPassword from 'Actions/setPasswordAction'
import verfiyEmail from 'Services/User/verfiyEmail'

import { Toast } from 'Snackbar/useToast'
import Title from './TitleComponent'

import { MinimalButton } from 'components/common/buttons'
import { MinimalInput } from 'components/Assets/components'

import { history } from 'helpers/history'
import getLogoName from 'helpers/getLogoName'
import getDomainName from 'helpers/getDomainName'
import { validateSchema } from 'helpers/schemaValidation'

import * as yup from 'yup'
import { get, isEmpty } from 'lodash'

class SetPasswordComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      password: '',
      confirmPassword: '',
      isLoading: false,
      errors: {},
      isShowPassword: false,
      isShowConfirmPassword: false,
    }
    this.nameLogo = getLogoName()
  }

  componentDidMount() {
    document.title = this.nameLogo.title
  }

  submit = () => {
    this.setState({ isLoading: true })
    const authuser = JSON.parse(localStorage.getItem('AuthResponse'))
    setPassword(this.state.password, getDomainName())
      .then(response => {
        verfiyEmail(get(authuser, 'challengeParam.userAttributes.email', ''))
          .then(() => {
            Toast.success('Password Changed Successfully !')
            this.setState({ isLoading: false })
            setTimeout(() => history.push('/login'), 300)
          })
          .catch(error => {
            this.setState({ isLoading: false })
          })
      })
      .catch(error => {
        const message = isEmpty(error.message) ? 'Something went wrong !' : error.message
        Toast.error(message)
        this.setState({ isLoading: false })
      })
  }

  formValidation = async e => {
    e.preventDefault()
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,99}$/
    const schema = yup.object().shape({
      password: yup.string().required('Password is required !').min(6, 'Password must be atleast of 6 characters').matches(regex, 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@, $, !, %, *, ?, &)'),
      confirmPassword: yup
        .string()
        .required('Confirm Password is required !')
        .oneOf([yup.ref('password')], 'Your passwords do not match.'),
    })
    const payload = {
      password: this.state.password,
      confirmPassword: this.state.confirmPassword,
    }
    const isValid = await validateSchema(payload, schema)
    this.setState({ errors: isValid })
    if (isValid === true) this.submit()
  }

  render() {
    return (
      <div>
        <Title />
        <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
          <CssBaseline />
          <div className='d-flex justify-content-center align-items-center flex-column'>
            <img alt='eG logo' src={this.nameLogo.logoPath} style={{ maxHeight: '100px' }} className='MuiAvatar-img mb-2' />
            <h4 className='text-bold my-2'>Set New Password</h4>
            <form style={{ width: '100%' }} onSubmit={this.formValidation}>
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

export default SetPasswordComponent
