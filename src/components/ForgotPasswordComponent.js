import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import $ from 'jquery'
import GetAwsAuthCredetial from '../Actions/GetAwsAuthCredetialAction'
import Amplify, { Auth } from 'aws-amplify'
import getDomainName from '../helpers/getDomainName'
import getLogoName from '../helpers/getLogoName'
import Title from './TitleComponent'
import { Toast } from '../Snackbar/useToast'
import { MinimalInput } from 'components/Assets/components'
import { history } from 'helpers/history'
import { MinimalButton } from 'components/common/buttons'

class ForgotPassword extends React.Component {
  constructor() {
    super()
    this.state = {
      email: '',
      errors: {},
      isLoading: false,
    }
    this.nameLogo = getLogoName()
  }

  componentDidMount() {
    document.title = this.nameLogo.title
    $('#favicon').attr('href', this.nameLogo.headerLogo)
  }

  resetPassword = e => {
    this.setState({ isLoading: true })
    GetAwsAuthCredetial(getDomainName())
      .then(authcredetilas => {
        Amplify.configure({ Auth: authcredetilas })
        Auth.forgotPassword(this.state.email.trim())
          .then(data => {
            $('#pageLoading').hide()
            Toast.success('Email sent successfully !')
            this.setState({ isLoading: false })
            setTimeout(() => history.push('/login'), 300)
          })
          .catch(err => {
            Toast.error(err)
            this.setState({ isLoading: false })
          })
      })
      .catch(error => {
        Toast.error('Something went wrong !')
        this.setState({ isLoading: false })
      })
  }

  formValidation = e => {
    e.preventDefault()
    if (!this.state.email.length) this.setState({ errors: { email: { error: true, msg: 'Email is required !' } } })
    else if (!this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) this.setState({ errors: { email: { error: true, msg: 'Enter a valid email !' } } })
    else {
      this.setState({ errors: { email: null } })
      this.resetPassword()
    }
  }

  render() {
    return (
      <div>
        <Title />
        <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
          <CssBaseline />
          <div className='d-flex justify-content-center align-items-center flex-column'>
            <img alt='eG logo' src={this.nameLogo.logoPath} style={{ maxHeight: '100px' }} className='MuiAvatar-img mb-2' />
            <h4 className='text-bold my-2'>Forgot Password</h4>
            <form style={{ width: '100%' }} onSubmit={this.formValidation} autoComplete='off'>
              <MinimalInput onFocus={() => this.setState({ errors: { email: null } })} error={this.state.errors.email} placeholder='Enter Email' value={this.state.email} onChange={e => this.setState({ email: e })} label='Email Address' w={99} />
              <MinimalButton loading={this.state.isLoading} loadingText='RESETTING PASSWORD...' type='submit' text='RESET PASSWORD' fullWidth variant='contained' color='primary' baseClassName='mt-2 mb-2' disabled={this.state.isLoading} />
            </form>
          </div>
        </Container>
      </div>
    )
  }
}

export default ForgotPassword
