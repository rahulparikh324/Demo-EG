import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import loginAction from '../../Actions/loginAction'
import { connect } from 'react-redux'
import _ from 'lodash'
import $ from 'jquery'
import getUserRoles from '../../Services/User/getUserRolesService'
import StoreAwsTokenData from '../../StoreAwsTokenData'
import Cryptr from 'cryptr'
import { MainContext } from 'components/Main/provider'
const cryptr = new Cryptr('myTotalySecretKey')
var self

const styles = theme => ({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'red',
    height: 48,
    padding: '0 30px',
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    backgroundColor: '#0000',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
})

class Login extends React.Component {
  static contextType = MainContext

  constructor() {
    super()
    self = this
    this.state = {
      userName: '',
      password: '',
      submited: false,
      loginUser: '',
      isLoading: false,
      formError: {},
      errorMessage: {},
    }
    this.handleChange = this.handleChange.bind(this)
  }
  async componentDidMount() {
    StoreAwsTokenData()
      .then(response => {
        var requestData = {
          username: response.username,
          // "password":cryptr.decrypt(response.password),
          password: null,
          // "password":cryptr.decrypt(response.password),
          notification_token: localStorage.getItem('fcmToken'),
          os: 'web',
        }

        // $('#pageLoading').show();
        this.props.login(requestData, this.context.setLoginSiteData, this.context.setFeatureFlag)
      })
      .catch(error => {})
    const Roles = await getUserRoles()
    const userRoles = Roles.data.data.list.map(role => ({ role_id: role.role_id, role_name: role.name }))

    localStorage.setItem('__userRoles', JSON.stringify(userRoles))
  }
  handleChange(e) {
    const { name, value } = e.target
    const { formError, errorMessage } = this.state
    this.setState({ [name]: value })

    if (value != '' || value != null) {
      delete formError[name]
    }
    this.setState({ formError, errorMessage })
  }

  loginBtnClick = e => {
    e.preventDefault()

    this.setState({ submited: true })
    const { userName, password } = this.state

    var formvalid = this.formValidation(userName, password)

    if (formvalid) {
      var requestData = {
        username: this.state.userName,
        // "password": this.state.password,
        password: null,
        notification_token: localStorage.getItem('fcmToken'),
        os: 'web',
      }

      $('#pageLoading').show()
      this.props.login(requestData, this.context.setLoginSiteData, this.context.setFeatureFlag)
    } else {
    }
  }

  formValidation(userName, password) {
    const { formError, errorMessage } = this.state
    var userNameValid = userName.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)

    if (userName == '' || userName == null) {
      formError['userName'] = true
      errorMessage['userName'] = 'Email Address is required'
    } else {
      delete formError['userName']
      delete errorMessage['userName']
    }

    if (password == '' || password == null) {
      formError['password'] = true
      errorMessage['password'] = 'Password is required'
    } else {
      delete formError['password']
      delete errorMessage['password']
    }

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })

      return false
    } else {
      return true
    }
  }

  render() {
    const { classes } = this.props
    let tostMsg = _.get(this, ['props', 'stateObj', 'tostMsg'], {})
    const { userName, password, submited, formError, errorMessage } = this.state

    return (
      <div>
        <Container id='root1' component='main' maxWidth='xs' className='screen_c'>
          <CssBaseline />
          <div className={classes.paper}>
            {/* <div className="loginwelcome">Welcome</div> */}
            {/* <div className="loginwelcome"> AssetCare</div> */}
            {/* <img alt="Sensaii" src="/proassets/images/project-jarvis.png" style={{ "width":"160px", "height":"160px"}} className="MuiAvatar-img"/> */}
            <Typography component='h1' variant='h5' className='text_c'>
              Loading...
            </Typography>
            {/* <form className={classes.form} onSubmit={this.loginBtnClick} >
						<TextField
							error={formError.userName}
							variant="outlined"
							margin="normal"
							// required
							fullWidth
							defaultValue={this.state.userName}
							id="userName"
							label="Email Address"
							name="userName"
							autoFocus
							onChange={this.handleChange}
							helperText={errorMessage.userName}
						/>
						<TextField
							error={formError.password}
							variant="outlined"
							margin="normal"
							// required
							fullWidth
							defaultValue={this.state.password}
							name="password"
							label="Password"
							type="password"
							id="password"
							onChange={this.handleChange}
							helperText={errorMessage.password}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							className={classes.submit}

						>
							Sign In
        				  </Button>
						  <div className="for_psw" style={{"textAlign":"right"}}><a href="/forgotpassword">Forgot password?</a></div>
						{this.state.isLoading ? <CircularProgress /> : ''}
					</form>
				 */}
          </div>
        </Container>
      </div>
    )
  }
}
function mapState(state) {
  var stateObj = state.loginReducer
  if (state.loginReducer.isAuthenticated) {
    const { loginUser } = state.loginReducer.loginData
    const { isLoading } = state.loginReducer.loading
    if (self) {
      self.setState({ isLoading: isLoading })
    }
    return { loginUser, isLoading, stateObj }
  } else {
    const { loginUser } = {}
    const { isLoading } = false
    if (self) {
      self.setState({ isLoading: isLoading })
    }
    return { loginUser, isLoading, stateObj }
  }
}

const actionCreators = {
  login: loginAction,
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(Login))
