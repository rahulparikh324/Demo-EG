import React, { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Title from './TitleComponent'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import OTPInput from 'react-otp-input'
import { CircularProgress, makeStyles } from '@material-ui/core'
import { MinimalButton } from './common/buttons'
import { Auth } from 'aws-amplify'
import { MainContext } from './Main/provider'
import { Toast } from 'Snackbar/useToast'

import Cryptr from 'cryptr'
import login from 'Services/loginService'
import enums from 'Constants/enums'

const cryptr = new Cryptr('myTotalySecretKey')

const useStyles = makeStyles(theme => ({
  otpContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: '45px !important',
    height: '45px !important',
    margin: '0 0.7rem !important',
    borderRadius: '4px !important',
    border: '1px solid #a1a1a1 !important',
    '& input': {
      textAlign: 'center',
    },
  },
}))

const Authentication = () => {
  const { mfaUser, setMFAUser } = useContext(MainContext)
  const mfaTime = mfaUser && mfaUser?.cognitoMfaTimer ? mfaUser.cognitoMfaTimer : 120

  const favicon = localStorage.getItem('favicon-logo')
  const [authCode, setAuthCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isResendCodeProcessing, setIsResendCodeProcessing] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(mfaTime)

  const classes = useStyles()

  useEffect(() => {
    if (!mfaUser || !mfaUser.loginData || !mfaUser.requestData) {
      window.location.replace('/login')
    }
  }, [mfaUser])

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerSeconds > 0) {
        let seconds = timerSeconds - 1 < 10 ? ('0' + (timerSeconds - 1)).slice(-2) : timerSeconds - 1
        setTimerSeconds(seconds)
      }
      if (timerSeconds === 0 || timerSeconds === '00') {
        clearInterval(interval)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })

  useEffect(() => {
    if (authCode && authCode?.length === 6 && !loading) {
      verifyMFACode()
    }
  }, [authCode])

  const verifyMFACode = async () => {
    if (timerSeconds <= 0 || authCode?.length !== 6) {
      return
    }

    setLoading(true)
    const user = JSON.parse(localStorage.getItem('AuthResponse'))
    await Auth.confirmSignIn(mfaUser.loginData, authCode, user.challengeName)
      .then(loggedUser => {
        if (loggedUser.signInUserSession !== null) {
          localStorage.setItem('accessToken', loggedUser.signInUserSession.idToken.jwtToken)
          const expireTokenDate = new Date(loggedUser.signInUserSession.idToken.payload.exp * 1000).toISOString()
          localStorage.setItem('expireAwsTokenDate', expireTokenDate)

          const password = mfaUser.requestData.password
          const loginReq = mfaUser.requestData
          loginReq.password = null

          login(loginReq)
            .then(response => {
              if (response.data.success > 0) {
                mfaUser.requestData.password = password
                const APP_URL = window.location.hostname.split('.')[0] === 'localhost' ? `http://localhost:3005/home/` : ['127', '192'].includes(window.location.hostname.split('.')[0]) ? `https://${window.location.hostname}:3005/home/` : `https://${window.location.hostname}/home/`
                window.location.replace(`${APP_URL + localStorage.getItem('accessToken')}/${cryptr.encrypt(mfaUser.requestData.username)}/${cryptr.encrypt(password)}`)
              } else {
                localStorage.clear()
                Toast.error(response.data.message)
                setLoading(false)
              }
            })
            .catch(error => {
              localStorage.clear()
              Toast.error(error)
              setLoading(false)
            })
        } else {
          localStorage.clear()
          Toast.error(enums.resMessages.awsLoginFailResponse)
          setAuthCode('')
          setLoading(false)
        }
      })
      .catch(err => {
        setAuthCode('')
        if (err) {
          if (err.code === 'CodeMismatchException' && timerSeconds != 0) {
            Toast.error(enums.errorMessages.error_msg_invalid_otp)
          } else {
            Toast.error(enums.errorMessages.error_msg_otp_expired)
          }
        } else {
          Toast.error(enums.resMessages.awsLoginFailResponse)
        }
        setLoading(false)
      })
  }

  const resendOtpLinkClick = async () => {
    setTimerSeconds(0)
    setIsResendCodeProcessing(true)
    await Auth.signIn(mfaUser.requestData.username, mfaUser.requestData.password)
      .then(user => {
        if (user) {
          localStorage.setItem('AuthResponse', JSON.stringify(user))
          Toast.success(enums.resMessages.msg_otp)
          setMFAUser({ loginData: user, requestData: mfaUser.requestData, cognitoMfaTimer: mfaUser.cognitoMfaTimer })
        } else {
          Toast.error(enums.resMessages.awsLoginFailResponse)
        }

        setTimerSeconds(mfaTime)
        setAuthCode('')
        setIsResendCodeProcessing(false)
      })
      .catch(err => {
        if (err) {
          Toast.error(err.message)
        } else {
          Toast.error(enums.resMessages.awsLoginFailResponse)
        }
        setIsResendCodeProcessing(false)
      })
  }

  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60

  return (
    <div>
      <Title favicon={favicon} />
      <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
        <CssBaseline />
        <div className='d-flex justify-content-center align-items-center flex-column'>
          {/* <img alt='eG logo' src={companyLogo} style={{ maxHeight: '100px' }} className='MuiAvatar-img' /> */}
          <svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 510 510' fill='none'>
            <path fillRule='evenodd' clipRule='evenodd' d='M37.442 230.371H348.72C361.066 230.371 371.162 240.467 371.162 252.813V447.951C371.162 460.276 361.066 470.371 348.72 470.371H37.442C25.096 470.371 15 460.276 15 447.951V252.813C15 240.467 25.096 230.371 37.442 230.371Z' fill='#FFC338' />
            <path fillRule='evenodd' clipRule='evenodd' d='M363.779 464.525C359.804 468.164 354.504 470.372 348.72 470.372H37.4421C31.6581 470.372 26.3571 468.164 22.3611 464.525L193.081 328.824L363.779 464.525Z' fill='#FFD064' />
            <path fillRule='evenodd' clipRule='evenodd' d='M37.4419 230.371H348.72C354.672 230.371 360.12 232.727 364.137 236.555L193.081 387.23L22.0249 236.555C26.0419 232.727 31.4889 230.371 37.4419 230.371Z' fill='#FFE177' />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M177.539 143.343H157.768C147.313 143.343 138.838 134.868 138.838 124.414V58.5618C138.838 48.1078 147.313 39.6328 157.768 39.6328H476.071C486.525 39.6328 495 48.1078 495 58.5618V124.414C495 134.868 486.525 143.343 476.071 143.343H244.595C244.595 143.343 211.757 176.181 197.833 190.105C196.57 191.368 194.729 191.861 193.003 191.399C191.278 190.937 189.93 189.589 189.468 187.864C185.473 172.956 177.539 143.343 177.539 143.343Z'
              fill='#778899'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M466.071 39.6328H476.071C486.525 39.6328 495 48.1078 495 58.5618V124.414C495 134.868 486.525 143.343 476.071 143.343H466.071C476.525 143.343 485 134.868 485 124.414V58.5618C485 48.1078 476.525 39.6328 466.071 39.6328ZM244.595 143.343L197.833 190.105C196.57 191.368 194.729 191.861 193.003 191.399C191.434 190.979 190.178 189.826 189.615 188.323L234.595 143.343H244.595Z'
              fill='#778899'
            />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M235.333 77.6302V67.9102C235.333 63.4952 238.918 59.9102 243.333 59.9102C247.749 59.9102 251.333 63.4952 251.333 67.9102V77.6302L259.751 72.7702C263.575 70.5622 268.471 71.8742 270.679 75.6982C272.887 79.5222 271.575 84.4192 267.751 86.6262L259.333 91.4862L267.751 96.3462C271.575 98.5542 272.887 103.45 270.679 107.274C268.471 111.098 263.575 112.41 259.751 110.202L251.333 105.342V115.061C251.333 119.477 247.749 123.061 243.333 123.061C238.918 123.061 235.333 119.477 235.333 115.061V105.343L226.916 110.202C223.092 112.41 218.196 111.098 215.988 107.274C213.78 103.45 215.092 98.5542 218.916 96.3462L227.334 91.4862L218.916 86.6262C215.092 84.4192 213.78 79.5222 215.988 75.6982C218.196 71.8742 223.092 70.5622 226.916 72.7702L235.333 77.6302ZM308.919 77.6302V67.9102C308.919 63.4952 312.504 59.9102 316.919 59.9102C321.334 59.9102 324.919 63.4952 324.919 67.9102V77.6302L333.337 72.7702C337.16 70.5622 342.057 71.8742 344.265 75.6982C346.472 79.5222 345.16 84.4192 341.337 86.6262L332.919 91.4862L341.337 96.3462C345.16 98.5542 346.472 103.45 344.265 107.274C342.057 111.098 337.16 112.41 333.337 110.202L324.919 105.342V115.061C324.919 119.477 321.334 123.061 316.919 123.061C312.504 123.061 308.919 119.477 308.919 115.061V105.343L300.502 110.202C296.678 112.41 291.781 111.098 289.574 107.274C287.366 103.45 288.678 98.5542 292.502 96.3462L300.919 91.4862L292.502 86.6262C288.678 84.4192 287.366 79.5222 289.574 75.6982C291.781 71.8742 296.678 70.5622 300.502 72.7702L308.919 77.6302ZM382.505 77.6302V67.9102C382.505 63.4952 386.089 59.9102 390.505 59.9102C394.92 59.9102 398.505 63.4952 398.505 67.9102V77.6302L406.922 72.7702C410.746 70.5622 415.643 71.8742 417.851 75.6982C420.058 79.5222 418.746 84.4192 414.922 86.6262L406.505 91.4862L414.922 96.3462C418.746 98.5542 420.058 103.45 417.851 107.274C415.643 111.098 410.746 112.41 406.922 110.202L398.505 105.342V115.061C398.505 119.477 394.92 123.061 390.505 123.061C386.089 123.061 382.505 119.477 382.505 115.061V105.343L374.087 110.202C370.264 112.41 365.367 111.098 363.159 107.274C360.952 103.45 362.264 98.5542 366.088 96.3462L374.505 91.4862L366.088 86.6262C362.264 84.4192 360.952 79.5222 363.159 75.6982C365.367 71.8742 370.264 70.5622 374.087 72.7702L382.505 77.6302Z'
              fill='#ECEFF1'
            />
          </svg>
          <h4 className='text-bold my-4'>Two Factor Authentication</h4>
          <div className='mb-3 text-center'>
            {' '}
            An OTP has been sent to your mobile number. This code will be valid for {String(Math.floor(mfaTime / 60)).padStart(2, '0')}:{String(mfaTime % 60).padStart(2, '0')} {Math.floor(mfaTime / 60) > 0 ? 'minutes' : 'seconds'}.
          </div>
          <div className='d-flex mt-2' style={{ minWidth: '100%' }}>
            <OTPInput inputType='tel' value={authCode} onChange={value => setAuthCode(value)} numInputs={6} renderInput={props => <input {...props} className={classes.otpInput} disabled={loading} />} shouldAutoFocus />
          </div>
          {timerSeconds != 0 || timerSeconds != '00' ? (
            <span className='minimal-input-label' style={{ marginTop: '15px', color: timerSeconds < 16 ? '#ff411f' : '#778899' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          ) : (
            <div style={{ marginTop: '15px' }}>
              {isResendCodeProcessing ? (
                <CircularProgress size={20} thickness={5} />
              ) : (
                <>
                  Not received your code?
                  <Link to='#' variant='body2' underline='none' className='  ' onClick={() => resendOtpLinkClick()} style={{ cursor: 'pointer' }} disabled={isResendCodeProcessing}>
                    {' '}
                    Resend Code
                  </Link>
                </>
              )}
            </div>
          )}
          <div style={{ marginTop: '15px' }}>
            <MinimalButton loading={loading || isResendCodeProcessing} disabled={loading || authCode?.length !== 6} loadingText='VERIFYING...' text='VERIFY' variant='contained' color='primary' baseClassName='custom-border-radius' style={{ height: '42px' }} onClick={verifyMFACode} />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Authentication
