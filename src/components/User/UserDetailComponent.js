import React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Input from '@material-ui/core/Input'
import getUserDetailAction from '../../Actions/User/getUserDetailAction'
import updateUserAction from '../../Actions/User/updateUserAction'
import updateUser from '../../Services/User/updateUserService'
import SnackbarAlert from '../../Snackbar/SnackbarAlert'
import getUserDetail from '../../Services/User/getUserDetailsService'

const styles = theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  selectEmpty: { marginTop: theme.spacing(2) },
  validation: { color: '#f44336', fontSize: '0.75rem', margin: '0 0 0 14px', paddingTop: '4px' },
})

var self
class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    self = this
    var logindata = localStorage.getItem('loginData')
    this.state = {
      loginData: JSON.parse(logindata),
      name: null,
      email: null,
      password: '',
      status: null,
      role: localStorage.getItem('roleName') === enums.userRoles[1].role ? [] : '',
      company: null,
      selectedSites: [],
      site: [],
      formError: {},
      errorMessage: {},
      allCompany: JSON.parse(localStorage.getItem('AllCompany')),
      userRoles: JSON.parse(localStorage.getItem('UserRoles')),
      fname: null,
      lname: null,
      language: '',
      tostMsg: {},
      operatorRoleId: '',
      selectedRoleName: '',
      defaultSite: '',
      defaultSiteOptions: [],
      defaultRole: '',
      defaultRoleOptions: [],
    }
    this.updateUser = this.updateUser.bind(this)
    this.handleOnchnage = this.handleOnchnage.bind(this)
  }

  async componentDidMount() {
    $('#pageLoading').show()
    this.props.getUserDetailAction(this.props.parameters.userId)
    setTimeout(() => {
      var selectedsites = []
      var merge_Sites = [..._.get(this, ['props', 'userDetailReducer', 'userDetail', 'usersites'], []), ...this.state.loginData.usersites]
      var unique_allSites = [...new Set(merge_Sites)]
      var allSites = []
      var company = ''

      if (_.get(this, ['props', 'userDetailReducer', 'userDetail', 'usersites'], []).length > 0) {
        if (localStorage.getItem('roleName') === enums.userRoles[1].role) {
          _.get(this, ['props', 'userDetailReducer', 'userDetail', 'usersites'], []).map((value, key) => {
            if (value.status === enums.userStatus[0].id) {
              selectedsites.push(value.site_id)
              company = value.company_id
              this.setState({ company: value.company_id })
            }
          })

          this.state.allCompany.map((value, key) => {
            if (value.company_id === company) {
              value.sites.map((value1, key1) => {
                allSites.push({
                  key: value1.site_id,
                  value: value1.site_name,
                })
              })
            }
          })
        } else {
          unique_allSites.map((value, key) => {
            if (value.status == enums.userStatus[0].id) {
              selectedsites.push(value.site_id)
              company = ''
              this.setState({ company: value.company_id })
            }
          })
          unique_allSites.map((value, key) => {
            allSites.push({
              site_id: value.site_id,
              site_name: value.site_name,
            })
          })
        }
      }

      var allRoles = JSON.parse(localStorage.getItem('UserRoles'))
      const roles = allRoles.map(role => ({ role_id: role.role_id, role_name: role.name }))
      roles.forEach(value => value.role_name === enums.userRoles[2].role && this.setState({ operatorRoleId: value.role_id }))

      this.setState({
        fname: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'firstname'], null),
        lname: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'lastname'], null),
        name: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'username'], null),
        email: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'email'], null),
        status: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'status'], null),
        userRoles: roles ? roles : [],
        selectedSites: selectedsites,
        site: this.state.loginData.usersites,
        language: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'prefer_language_id'], null),
      })
    }, 1000)
    const detailsRes = await getUserDetail(this.props.parameters.userId)
    const userDetail = detailsRes.data.data

    const company = userDetail.usersites[0].company_id
    const role = userDetail.userroles.map(({ role_id }) => role_id)
    const site = localStorage.getItem('roleName') === enums.userRoles[1].role ? this.state.allCompany.filter(comp => comp.company_id === company)[0].sites : this.state.loginData.usersites
    const selectedRoleName = this.state.userRoles.filter(x => x.role_id === role[0])[0].role_name
    const defaultRoleOptions = []
    role.forEach(element => {
      const q = this.state.userRoles.filter(x => x.role_id === element)[0]
      defaultRoleOptions.push(q)
    })
    // console.log(userDetail)
    // console.log('def role opts', defaultRoleOptions)

    this.setState({ site, role, defaultRoleOptions, defaultRole: userDetail.default_rolename_app, selectedRoleName, defaultSiteOptions: userDetail.usersites, defaultSite: userDetail.default_site_id })
  }

  updateUser() {
    var loginData = localStorage.getItem('loginData')
    loginData = JSON.parse(loginData)
    var formvalid = this.formValidation(this.state.fname, this.state.lname, this.state.name, this.state.email, this.state.status, this.state.role, this.state.company, this.state.selectedSites, this.state.language)

    if (formvalid) {
      const userSites =
        this.state.selectedRoleName === 'Operator' || this.state.selectedRoleName === 'Maintenance staff' ? [{ site_id: this.state.selectedSites, status: parseInt(this.state.status), company_id: this.state.company }] : this.state.selectedSites.map(item => ({ site_id: item, status: parseInt(this.state.status), company_id: this.state.company }))

      var requestData = {
        requestby: this.state.loginData.uuid,
        uuid: _.get(this, ['props', 'userDetailReducer', 'userDetail', 'uuid'], []),
        email: this.state.email,
        username: this.state.name,
        firstname: this.state.fname,
        lastname: this.state.lname,
        ac_default_role_app: this.state.defaultRole,
        ac_default_role_web: this.state.defaultRole,
        ac_default_site: this.state.defaultSite,
        ac_active_role_app: this.state.defaultRole,
        ac_active_role_web: this.state.defaultRole,
        ac_active_site: this.state.defaultSite,
        prefer_language_id: this.state.language ? parseInt(this.state.language) : 0,
        status: parseInt(this.state.status),
        userroles: this.state.role.map(r => ({ role_id: r })),
        usersites: userSites,
      }

      //console.log('request data=======================')
      //console.log(requestData)

      //$('#pageLoading').show()
      //this.props.updateUserAction(requestData)
    }
  }

  handleOnchnage = e => {
    const { formError, errorMessage } = this.state
    const { name, value } = e.target

    this.setState({ [name]: value })

    if (value !== '' || value !== null) {
      delete formError[name]
      delete errorMessage[name]
    }
    this.setState({ formError, errorMessage })

    if (name === 'selectedDefSites') {
      //console.log('default site', value)
      this.setState({ defaultSite: value })
    }

    if (name === 'role') {
      if (localStorage.getItem('roleName') === 'SuperAdmin') {
        if (value.length === 1) {
          this.setState({ defaultRole: value[0] })
        }
        if (value.length === 0) {
          this.setState({ defaultRole: '' })
        }
        const selectedRolesByAdmin = []
        value.forEach(element => {
          selectedRolesByAdmin.push(this.state.userRoles.filter(role => role.role_id === element)[0])
        })
        this.setState({ defaultRoleOptions: selectedRolesByAdmin })
      }
    }

    if (name === 'company') {
      var allSites = []
      // console.log(value)
      if (value !== '') {
        let selectCompany = this.state.allCompany.filter(x => x.company_id === value)
        selectCompany[0].sites.map((value, key) => {
          allSites.push({
            site_id: value.site_id,
            site_name: value.site_name,
          })
        })
        this.setState({ site: allSites, selectedSites: [] })
      } else {
        this.setState({ site: [], selectedSites: [] })
      }
    } else if (name === 'selectedSites') {
      const selectedSites = []
      const typeOfValueIsAnArray = Array.isArray(value)
      if (typeOfValueIsAnArray) value.forEach(element => selectedSites.push(this.state.site.filter(site => site.site_id === element)[0]))
      else selectedSites.push(this.state.site.filter(site => site.site_id === value)[0])
      this.setState({ defaultSiteOptions: selectedSites })
    }
  }

  formValidation(fname, lname, name, email, status, role, company, site, language) {
    const { formError, errorMessage } = this.state

    if (email !== '' && email !== null) {
      var emailValid = email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
      if (!emailValid) {
        formError['email'] = true
        errorMessage['email'] = 'Email is not valid'
      } else {
        delete formError['email']
        delete errorMessage['email']
      }
    } else {
      formError['email'] = true
      errorMessage['email'] = 'Email is required'
    }

    if (fname === '' || fname === null) {
      formError['fname'] = true
      errorMessage['fname'] = 'First name is required'
    } else {
      delete formError['fname']
      delete errorMessage['fname']
    }

    if (lname === '' || lname === null) {
      formError['lname'] = true
      errorMessage['lname'] = 'Last name is required'
    } else {
      delete formError['lname']
      delete errorMessage['lname']
    }

    if (name === '' || name === null) {
      formError['name'] = true
      errorMessage['name'] = 'User name is required'
    } else {
      delete formError['name']
      delete errorMessage['name']
    }

    if (status == '' || status == null) {
      formError['status'] = true
      errorMessage['status'] = 'Please select status'
    } else {
      delete formError['status']
      delete errorMessage['status']
    }

    if (role == '' || role == null) {
      formError['role'] = true
      errorMessage['role'] = 'Please select role'
    } else {
      delete formError['role']
      delete errorMessage['role']
    }

    if (localStorage.getItem('roleName') == enums.userRoles[1].role) {
      if (company == '' || company == null) {
        formError['company'] = true
        errorMessage['company'] = 'Please select company'
      } else {
        delete formError['company']
        delete errorMessage['company']
      }
    }

    if (site == '' || site == null) {
      formError['selectedSites'] = true
      errorMessage['selectedSites'] = 'Please select site'
    } else {
      delete formError['selectedSites']
      delete errorMessage['selectedSites']
    }

    if (_.get(this, ['props', 'userDetailReducer', 'userDetail', 'role_name'], null) == enums.userRoles[2].role) {
      if (language == '' || language == null) {
        formError['language'] = true
        errorMessage['language'] = 'Please select language'
      } else {
        delete formError['language']
        delete errorMessage['language']
      }
    }

    if (this.state.defaultRole === '') {
      formError['defaultRole'] = true
      errorMessage['defaultRole'] = 'Please select a default role'
    } else {
      delete formError['defaultRole']
      delete errorMessage['defaultRole']
    }

    // console.log(formError)

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })
      return false
    } else {
      return true
    }
  }

  render() {
    // console.log(this.state)
    const sites = _.uniqBy(this.state.site, 'key')
    const { formError, errorMessage } = this.state
    const { classes } = this.props
    const ITEM_HEIGHT = 48
    const ITEM_PADDING_TOP = 8
    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    }

    return (
      <div>
        <Grid className='inspection-title bottom-lines'>
          <h5>User Details</h5>
          <Grid className='inspection-breadcrum'>
            <ul className='bread-crum'>
              <li>
                <Link to={'../users'}>User </Link>
              </li>
              <li> {'>'} </li>
              <li>{this.props.parameters.userId}</li>
            </ul>
          </Grid>
        </Grid>

        <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-12'>
          <Grid className='assets-wrap-container padding-sections'>
            <Grid>
              <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
                <Grid className='assets-info-container '>
                  <Grid className='row'>
                    <form>
                      <Grid className='assent-info-form-part1'>
                        <Grid className='row'>
                          <Grid className='col-md-6'>
                            <Grid className='assets-info-devider'>
                              <TextField
                                error={formError.fname}
                                variant='outlined'
                                margin='normal'
                                fullWidth
                                id='fname'
                                label='First name'
                                name='fname'
                                value={this.state.fname == null ? _.get(this, ['props', 'userDetailReducer', 'userDetail', 'firstname'], '') : this.state.fname}
                                onChange={e => this.handleOnchnage(e)}
                                helperText={errorMessage.fname}
                              />
                            </Grid>
                          </Grid>
                          <Grid className='col-md-6'>
                            <Grid className='assets-info-devider'>
                              <TextField
                                error={formError.lname}
                                variant='outlined'
                                margin='normal'
                                fullWidth
                                id='lname'
                                label='Last name'
                                name='lname'
                                value={this.state.lname == null ? _.get(this, ['props', 'userDetailReducer', 'userDetail', 'lastname'], '') : this.state.lname}
                                onChange={e => this.handleOnchnage(e)}
                                helperText={errorMessage.lname}
                              />
                            </Grid>
                          </Grid>
                          <Grid className='col-md-6'>
                            <Grid className='assets-info-devider'>
                              <TextField
                                error={formError.name}
                                variant='outlined'
                                margin='normal'
                                fullWidth
                                id='name'
                                label='User name'
                                name='name'
                                disabled
                                value={this.state.name == null ? _.get(this, ['props', 'userDetailReducer', 'userDetail', 'username'], '') : this.state.name}
                                onChange={e => this.handleOnchnage(e)}
                                helperText={errorMessage.name}
                              />
                            </Grid>
                          </Grid>

                          <Grid className='col-md-6'>
                            <Grid className='assets-info-devider'>
                              <TextField error={formError.email} variant='outlined' margin='normal' fullWidth id='email' label='Email' name='email' value={this.state.email == null ? _.get(this, ['props', 'userDetailReducer', 'userDetail', 'email'], '') : this.state.email} onChange={e => this.handleOnchnage(e)} helperText={errorMessage.email} />
                            </Grid>
                          </Grid>

                          <Grid className='col-md-6'>
                            <div className='drp-priority'>
                              <Grid className='assets-info-devider'>
                                <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                  <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                    Select a status
                                  </InputLabel>
                                  <Select native fullWidth name='status' value={this.state.status == null ? _.get(this, ['props', 'userDetailReducer', 'userDetail', 'status_name'], '') : this.state.status} inputProps={{ name: 'status', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)}>
                                    <option value=''>Select a Status</option>
                                    {enums.userStatus.map((value, key) => {
                                      if (value.id !== enums.userStatus[2].id) {
                                        return (
                                          <option value={value.id} key={key}>
                                            {value.status}
                                          </option>
                                        )
                                      }
                                    })}
                                  </Select>
                                  {formError.status ? <div className={classes.validation}>{errorMessage.status}</div> : ''}
                                </FormControl>
                              </Grid>
                            </div>
                          </Grid>

                          <Grid className='col-md-6'>
                            <div className='drp-priority select-line-height'>
                              <Grid className='assets-info-devider'>
                                <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                  <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                    Select a Role
                                  </InputLabel>
                                  {localStorage.getItem('roleName') === enums.userRoles[0].role && (
                                    <Select native fullWidth name='role' value={this.state.role} inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helperText={errorMessage.role}>
                                      <option value=''>Select a Role</option>
                                      {_.get(this, ['state', 'userRoles'], []).map((value, key) => {
                                        return (
                                          <option value={value.role_id} key={key}>
                                            {value.name}
                                          </option>
                                        )
                                      })}
                                    </Select>
                                  )}
                                  {localStorage.getItem('roleName') === enums.userRoles[1].role && (
                                    <Select multiple variant='outlined' value={this.state.role} fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helperText={errorMessage.role} MenuProps={MenuProps}>
                                      {this.state.userRoles.map(value => {
                                        if (value.role_name !== 'Operator' && value.role_name !== 'Maintenance staff' && value.role_name !== 'SuperAdmin') {
                                          return (
                                            <MenuItem value={value.role_id} key={value.role_id}>
                                              {value.role_name}
                                            </MenuItem>
                                          )
                                        }
                                      })}
                                    </Select>
                                  )}
                                  {formError.role ? <div className={classes.validation}>{errorMessage.role}</div> : ''}
                                </FormControl>
                              </Grid>
                            </div>
                          </Grid>

                          {localStorage.getItem('roleName') === enums.userRoles[1].role && (
                            <Grid className='col-md-6'>
                              <div className='drp-priority'>
                                <Grid className='assets-info-devider'>
                                  <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                    <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                      Select a default Role
                                    </InputLabel>
                                    <Select native fullWidth name='roleDef' value={this.state.defaultRole} inputProps={{ name: 'roleDef', id: 'outlined-age-native-simple-role-def' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helperText={errorMessage.role}>
                                      {_.get(this, ['state', 'defaultRoleOptions'], []).map((value, key) => {
                                        return (
                                          <option value={value.role_id} key={key}>
                                            {value.role_name}
                                          </option>
                                        )
                                      })}
                                    </Select>
                                    {formError.defaultRole ? <div className={classes.validation}>{errorMessage.defaultRole}</div> : ''}
                                  </FormControl>
                                </Grid>
                              </div>
                            </Grid>
                          )}

                          {localStorage.getItem('roleName') === enums.userRoles[1].role && (
                            <Grid className='col-md-6'>
                              <div className='drp-priority'>
                                <Grid className='assets-info-devider'>
                                  <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                    <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                      Select a company
                                    </InputLabel>
                                    <Select native fullWidth value={!this.state.company ? '' : this.state.company} name='company' inputProps={{ name: 'company', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)}>
                                      <option value=''>Select a company</option>
                                      {this.state.allCompany.map((value, key) => {
                                        return (
                                          <option value={value.company_id} key={key}>
                                            {value.company_name}
                                          </option>
                                        )
                                      })}
                                    </Select>
                                    {formError.company ? <div className={classes.validation}>{errorMessage.company}</div> : ''}
                                  </FormControl>
                                </Grid>
                              </div>
                            </Grid>
                          )}

                          <Grid className='col-md-6'>
                            <div className='drp-priority drp-multiselect' style={{ marginTop: '16px' }}>
                              <Grid className='assets-info-devider'>
                                <FormControl fullWidth variant='outlined' className={classes.formControl + ' mr0'}>
                                  <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simplemultiselect' className='input-lbl-drp'>
                                    Select a site
                                  </InputLabel>
                                  {this.state.selectedRoleName === 'Operator' || this.state.selectedRoleName === 'Maintenance staff' ? (
                                    <Select variant='outlined' fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} value={this.state.selectedSites} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                      {this.state.site.map(value => (
                                        <MenuItem key={value.site_id} value={value.site_id}>
                                          {value.site_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  ) : (
                                    <Select multiple variant='outlined' fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} value={this.state.selectedSites} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                      {this.state.site.map(value => (
                                        <MenuItem key={value.site_id} value={value.site_id}>
                                          {value.site_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                  {formError.selectedSites ? <div className={classes.validation}>{errorMessage.selectedSites}</div> : ''}
                                </FormControl>
                              </Grid>
                            </div>
                          </Grid>

                          {(['Manager', 'Executive', 'SuperAdmin'].includes(this.state.selectedRoleName) || ['Manager', 'Executive', 'SuperAdmin'].includes(this.state.selectedRoleName[0])) && (
                            <Grid className='col-md-6'>
                              <div className='drp-priority drp-multiselect' style={{ marginTop: '16px' }}>
                                <Grid className='assets-info-devider'>
                                  <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                    <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                      Select a default site
                                    </InputLabel>
                                    <Select variant='outlined' fullWidth name='selectedDefSites' inputProps={{ name: 'selectedDefSites', id: 'outlined-age-native-simple' }} value={this.state.defaultSite} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                      {this.state.defaultSiteOptions.map(value => (
                                        <MenuItem key={value.site_id} value={value.site_id}>
                                          {value.site_name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  {formError.defaultSite ? <div className={classes.validation}>{errorMessage.defaultSite}</div> : ''}
                                </Grid>
                              </div>
                            </Grid>
                          )}

                          {_.get(this, ['props', 'userDetailReducer', 'userDetail', 'role_name'], null) === enums.userRoles[2].role && (
                            <Grid className='col-md-6'>
                              <div className='drp-priority'>
                                <Grid className='assets-info-devider'>
                                  <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                    <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                      Select a language
                                    </InputLabel>
                                    <Select native fullWidth name='language' value={this.state.language} inputProps={{ name: 'language', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.language} helperText={errorMessage.language}>
                                      <option value=''>Select a language</option>
                                      {enums.Language.map((value, key) => {
                                        return (
                                          <option value={value.id} key={key}>
                                            {value.language}
                                          </option>
                                        )
                                      })}
                                    </Select>
                                    {formError.language ? <div className={classes.validation}>{errorMessage.language}</div> : ''}
                                  </FormControl>
                                </Grid>
                              </div>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>

                      <Grid className='assets-buttons-part user_btn_bottom'>
                        <Button variant='contained' color='primary' className='assets-bottons txt-normal' style={{ fontSize: '13px' }} onClick={this.updateUser}>
                          Save
                        </Button>
                        <Button variant='contained' color='primary' className='assets-bottons txt-normal' style={{ fontSize: '13px' }} component={Link} to={'../../users'}>
                          Cancel
                        </Button>
                      </Grid>
                    </form>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <SnackbarAlert tostMsg={this.state.tostMsg} />
      </div>
    )
  }
}

function mapState(state) {
  //console.log('userdetail map state----------------', state)
  if (self) {
    if (!_.isEmpty(state.userDetailReducer.tostMsg)) {
      self.setState({ tostMsg: state.userDetailReducer.tostMsg })
    }
    if (!_.isEmpty(state.userReducer.tostMsg1)) {
      self.setState({ tostMsg: state.userReducer.tostMsg1 })
    }
    if (!_.isEmpty(state.userDetailReducer.userDetail)) {
      var roles = state.userDetailReducer.userDetail.userroles.map(({ role_id }) => role_id)
      const allSites = []
      // console.log(state.userDetailReducer.userDetail)

      self.setState({
        fname: _.get(state, ['userDetailReducer', 'userDetail', 'firstname'], null),
        lname: _.get(state, ['userDetailReducer', 'userDetail', 'lastname'], null),
        name: _.get(state, ['userDetailReducer', 'userDetail', 'username'], null),
        email: _.get(state, ['userDetailReducer', 'userDetail', 'email'], null),
        status: _.get(state, ['userDetailReducer', 'userDetail', 'status'], null),
        selectedSites: _.get(state, ['userDetailReducer', 'userDetail', 'usersites'], []).map(s => s.site_id),
        company: _.get(state, ['userDetailReducer', 'userDetail', 'usersites'], [])[0].company_id,
        language: _.get(state, ['userDetailReducer', 'userDetail', 'prefer_language_id'], null),
        //site: allSites,
      })
    }
  }
  return state
}

const actionCreators = {
  getUserDetailAction: getUserDetailAction,
  updateUserAction: updateUserAction,
}

UserDetail.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapState, actionCreators)(withStyles(styles)(UserDetail))
