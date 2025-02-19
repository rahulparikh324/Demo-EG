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
import createUserAction from '../../Actions/User/createUserAction'
import createUser from '../../Services/User/createUserService'
import { Toast } from '../../Snackbar/useToast'
import companyList from '../../Services/getAllCompany'
import getUserRole from '../../helpers/getUserRole'
import { ErrorDiv } from '../Notification/components'
import { history } from '../../helpers/history'
import { handleNewRole } from '../../helpers/handleNewRole'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const styles = theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  selectEmpty: { marginTop: theme.spacing(2) },
  validation: { color: '#f44336', fontSize: '0.75rem', margin: '0 0 0 14px', paddingTop: '4px' },
})

class CreateUser extends React.Component {
  constructor(props) {
    super(props)
    var logindata = localStorage.getItem('loginData')
    logindata = JSON.parse(logindata)
    this.checkUserRole = new getUserRole()
    this.state = {
      loginData: logindata,
      allSiteObject: logindata.usersites.filter(site => site.status === 20),
      name: '',
      email: '',
      password: '',
      status: '',
      role: '',
      company: localStorage.getItem('companyId'),
      selectedSites: [],
      site: [],
      formError: {},
      errorMessage: {},
      allCompany: [],
      userRoles: JSON.parse(localStorage.getItem('__userRoles')),
      fname: '',
      lname: '',
      language: '',
      operatorRoleId: '',
      selectedRoleName: '',
      defaultSiteOptions: [],
      defaultSite: '',
      roleWhenAdmin: [],
      allowMultipleRole: true,
      selectedRolesByAdmin: [],
      defaultRole: '',
    }
    this.createUser_ = this.createUser_.bind(this)
    this.handleOnchnage = this.handleOnchnage.bind(this)
  }

  async componentDidMount() {
    if (this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin()) this.setState({ site: this.state.loginData.usersites.filter(site => site.status !== 20), selectedSites: [] })
    if (this.checkUserRole.isSuperAdmin()) {
      const allCompaniesList = await companyList()
      const allCompany = allCompaniesList.data.data
      this.setState({ allCompany })
    }
    this.setState({ language: enums.Language[0].id, operatorRoleId: this.state.userRoles[0].role_id })
    if (this.checkUserRole.isManager()) {
      this.setState({ role: this.state.userRoles[3].role_id, selectedRoleName: 'Technician' })
    }
  }

  async createUser_() {
    ////console.log(this.state)
    var formvalid = this.formValidation(this.state.fname, this.state.lname, this.state.name, this.state.email, this.state.status, this.state.role, this.state.company, this.state.selectedSites, this.state.language, this.state.defaultSite)
    if (formvalid) {
      var userSites = []
      var userRoles = []
      var defRole = ''
      var company = ''
      if (this.checkUserRole.isManager()) {
        if (this.state.selectedRoleName === 'Operator' || this.state.selectedRoleName === 'Maintenance staff') {
          userSites = [{ site_id: this.state.selectedSites, status: 1, company_id: this.state.loginData.usersites[0].company_id }]
        } else {
          userSites = this.state.selectedSites.map(item => ({ site_id: item, status: 1, company_id: this.state.loginData.usersites[0].company_id }))
        }
        defRole = this.state.role
        userRoles = [{ role_id: this.state.role }]
        company = this.state.loginData.usersites[0].company_id
      }
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) {
        this.state.role.forEach(x => userRoles.push({ role_id: x }))
        defRole = this.state.defaultRole === '' ? this.state.role[0] : this.state.defaultRole
        company = this.state.company
        if (this.state.selectedRoleName.includes('Operator')) {
          userSites = [{ site_id: this.state.selectedSites, status: 1, company_id: company }]
        } else {
          this.state.selectedSites.forEach(x => {
            const site = this.state.site.filter(s => s.site_id === x)[0]
            userSites.push(site)
          })
        }
      }

      var requestData = {
        email: this.state.role === this.state.operatorRoleId || this.state.selectedRoleName.includes('Operator') ? this.getOPUsername() : this.state.email.toLowerCase(),
        password: this.state.password,
        username: this.state.role === this.state.operatorRoleId || this.state.selectedRoleName.includes('Operator') ? this.getOPUsername() : this.state.name.toLowerCase(),
        firstname: this.state.fname,
        lastname: this.state.lname,
        ac_default_role_app: defRole,
        ac_default_role_web: defRole,
        ac_default_site: _.isEmpty(this.state.defaultSite) ? getApplicationStorageItem('siteId') : this.state.defaultSite,
        ac_active_role_app: defRole,
        ac_active_role_web: defRole,
        ac_active_site: _.isEmpty(this.state.defaultSite) ? getApplicationStorageItem('siteId') : this.state.defaultSite,
        prefer_language_id: this.state.language ? parseInt(this.state.language) : null,
        status: parseInt(this.state.status),
        userroles: userRoles,
        usersites: userSites,
        ac_default_company: company,
        ac_active_company: company,
      }
      // console.log('Req Payload', requestData)
      $('#pageLoading').show()
      try {
        const res = await createUser(requestData)
        // console.log(res.data)
        if (res.data.success === 1) {
          Toast.success('User created successfully !')
          history.push('../../users')
        } else Toast.error(res.data.message)
      } catch (error) {
        Toast.error('Something went wrong !')
      }
      $('#pageLoading').hide()
      //this.props.createUserAction(requestData)
    }
  }

  handleOnchnage = e => {
    const { formError, errorMessage } = this.state
    const { name, value } = e.target
    //console.log(value)

    this.setState({ [name]: value })

    if (value !== '' || value !== null) {
      delete formError[name]
      delete errorMessage[name]
    }
    this.setState({ formError, errorMessage })

    if (name === 'role') {
      const filteredRole = this.state.userRoles.filter(role => role.role_id === value)
      if (this.checkUserRole.isManager()) {
        // console.log(value, filteredRole)
        if (['Operator', 'Maintenance staff'].includes(filteredRole[0].role_name)) {
          this.setState({ selectedSites: getApplicationStorageItem('siteId'), selectedRoleName: filteredRole[0].role_name })
        } else {
          this.setState({ selectedSites: [], selectedRoleName: 'Manager' })
        }
      }
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) {
        const selectedRoleName = []
        const selectedRolesByAdmin = []
        value.forEach(element => {
          selectedRoleName.push(this.state.userRoles.filter(role => role.role_id === element)[0].role_name)
          selectedRolesByAdmin.push(this.state.userRoles.filter(role => role.role_id === element)[0])
        })
        this.setState({ roleWhenAdmin: value, selectedSites: [], defaultSite: [], defaultSiteOptions: [], selectedRoleName, selectedRolesByAdmin })
        if (selectedRoleName.includes('Company Admin') && this.checkUserRole.isCompanyAdmin()) {
          this.setState({
            selectedSites: this.state.site.map(s => s.site_id),
            defaultSiteOptions: this.state.loginData.usersites,
          })
        }
        if (selectedRoleName.includes('Company Admin') && this.checkUserRole.isSuperAdmin()) {
          // console.log('role change to CA when SA')
        }
      }
    }

    if (name === 'selectedSites') {
      //console.log(value)
      const selectedSites = []
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isManager()) {
        if (Array.isArray(value)) value.forEach(element => selectedSites.push(this.state.site.filter(site => site.site_id === element)[0]))
        else [value].forEach(element => selectedSites.push(this.state.site.filter(site => site.site_id === element)[0]))
      }
      if (value.length > 1) selectedSites.push(this.state.allSiteObject[0])
      // console.log(selectedSites)
      if (selectedSites.length === 1) {
        //set selected site in default selected and remove validation as one site is selected
        this.setState({ defaultSite: selectedSites[0] })
        delete formError['defaultSite']
        delete errorMessage['defaultSite']
        this.setState({ formError, errorMessage })
      }
      this.setState({ defaultSiteOptions: selectedSites })
    }
    if (name === 'selectedDefSites') {
      //console.log('def site', value)
      this.setState({ defaultSite: value })
    }
    if (name === 'roleDef') {
      this.setState({ defaultRole: value })
    }
    if (name === 'company') {
      // console.log('comp', value)
      if (value !== '') {
        let selectCompany = this.state.allCompany.filter(x => x.company_id === value)
        this.setState({ site: selectCompany[0].sites, selectedSites: [] })
        if (this.state.selectedRoleName.includes('Company Admin')) {
          // console.log(selectCompany[0].sites)
          this.setState({
            selectedSites: selectCompany[0].sites.map(site => site.site_id),
            defaultSiteOptions: [...selectCompany[0].sites, ...this.state.allSiteObject],
          })
        }
      } else {
        this.setState({ site: [], selectedSites: [] })
      }
    }
  }

  getOPUsername = () => `${this.state.fname.toLowerCase()}${this.state.lname.toLowerCase()}${Date.now().toString(36)}`

  formValidation(fname, lname, name, email, status, role, company, site, language, defaultsite) {
    const { formError, errorMessage } = this.state
    var emailValid = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/.test(email)

    if (email === '') {
      formError['email'] = true
      errorMessage['email'] = 'Email is required'
    } else if (!emailValid) {
      formError['email'] = true
      errorMessage['email'] = 'Email is invalid'
    } else {
      delete formError['email']
      delete errorMessage['email']
    }

    if (name.length !== 0 && email.length !== 0 && name.toLowerCase() !== email.toLowerCase()) {
      formError['name'] = true
      errorMessage['name'] = 'User name must be same as email'
    } else {
      delete formError['name']
      delete errorMessage['name']
    }

    if (name === '' || name.length === 0) {
      formError['name'] = true
      errorMessage['name'] = 'User name is required'
    } else if (name.length !== 0 && name === email) {
      delete formError['name']
      delete errorMessage['name']
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

    if (status === '' || status === null) {
      formError['status'] = true
      errorMessage['status'] = 'Please select status'
    } else {
      delete formError['status']
      delete errorMessage['status']
    }

    if (role === '' || role === null) {
      formError['role'] = true
      errorMessage['role'] = 'Please select role'
    } else {
      delete formError['role']
      delete errorMessage['role']
    }

    if (localStorage.getItem('roleName') === enums.userRoles[1].role) {
      if (company === '' || company === null) {
        formError['company'] = true
        errorMessage['company'] = 'Please select company'
      } else {
        delete formError['company']
        delete errorMessage['company']
      }
    }

    if (site.length === 0) {
      formError['selectedSites'] = true
      errorMessage['selectedSites'] = 'Please select Facilities'
    } else {
      delete formError['selectedSites']
      delete errorMessage['selectedSites']
    }

    if (defaultsite.length === 0) {
      formError['defaultSite'] = true
      errorMessage['defaultSite'] = 'Please select default Facilities'
    } else {
      delete formError['defaultSite']
      delete errorMessage['defaultSite']
    }
    if (this.state.role === this.state.operatorRoleId) {
      if (language === '' || language === null) {
        formError['language'] = true
        errorMessage['language'] = 'Please select language'
      } else {
        delete formError['language']
        delete errorMessage['language']
      }
    }

    if (_.isEmpty(formError)) {
      return true
    } else if (this.state.selectedRoleName === 'Operator' || this.state.selectedRoleName.includes('Operator')) {
      const errArr = []
      Object.keys(this.state.formError).forEach(key => {
        if (key !== 'email' && key !== 'name') errArr.push(this.state.formError[key])
      })
      const unq = [...new Set(errArr)]
      if (unq.length === 0) {
        return true
      } else {
        this.setState({ formError, errorMessage })
        return false
      }
    } else {
      this.setState({ formError, errorMessage })
      return false
    }
  }

  render() {
    const { formError, errorMessage } = this.state
    const { classes } = this.props
    const ITEM_HEIGHT = 48
    const ITEM_PADDING_TOP = 8
    const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } } }
    // console.log(this.state)
    return (
      <div style={{ padding: '0 20px', background: '#fff' }}>
        <Grid className='div_center'>
          <Grid className='row'>
            <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-12'>
              <Grid className='inspection-title bottom-lines'>
                <h5>Create User</h5>
              </Grid>
              <Grid className='assets-wrap-container padding-sections rounded-lg'>
                <Grid>
                  <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
                    <Grid className='assets-info-container '>
                      <Grid className='row'>
                        <form autoComplete='off'>
                          <Grid className='assent-info-form-part1'>
                            <Grid className='row'>
                              <Grid className='col-md-6'>
                                <Grid className='assets-info-devider'>
                                  <TextField error={formError.fname} variant='outlined' margin='normal' fullWidth id='fname' label='First name' name='fname' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.fname} />
                                </Grid>
                              </Grid>
                              <Grid className='col-md-6'>
                                <Grid className='assets-info-devider'>
                                  <TextField error={formError.lname} variant='outlined' margin='normal' fullWidth id='lname' label='Last name' name='lname' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.lname} />
                                </Grid>
                              </Grid>

                              {this.checkUserRole.isManager() ? (
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField error={formError.name} variant='outlined' margin='normal' fullWidth id='name' label='User name' name='name' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.name} />
                                  </Grid>
                                </Grid>
                              ) : this.state.selectedRoleName.length === 1 && this.state.selectedRoleName[0] === 'Operator' ? (
                                <></>
                              ) : (
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField error={formError.name} variant='outlined' margin='normal' fullWidth id='name' label='User name' name='name' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.name} />
                                  </Grid>
                                </Grid>
                              )}

                              {this.checkUserRole.isManager() ? (
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField error={formError.email} variant='outlined' margin='normal' fullWidth id='email' label='Email' name='email' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.email} />
                                  </Grid>
                                </Grid>
                              ) : this.state.selectedRoleName.length === 1 && this.state.selectedRoleName[0] === 'Operator' ? (
                                <></>
                              ) : (
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField error={formError.email} variant='outlined' margin='normal' fullWidth id='email' label='Email' name='email' onChange={e => this.handleOnchnage(e)} helperText={errorMessage.email} />
                                  </Grid>
                                </Grid>
                              )}

                              <Grid className='col-md-6'>
                                <div className='drp-priority'>
                                  <Grid className='assets-info-devider'>
                                    <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                      <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                        Select a status
                                      </InputLabel>
                                      <Select native fullWidth name='status' inputProps={{ name: 'status', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.status} helpertext={errorMessage.status}>
                                        <option value=''>Select a Status</option>
                                        {enums.userStatus.map((value, key) => (
                                          <option value={value.id} key={key}>
                                            {value.status}
                                          </option>
                                        ))}
                                      </Select>
                                      {formError.status ? <div className={classes.validation}>{errorMessage.status}</div> : ''}
                                    </FormControl>
                                  </Grid>
                                </div>
                              </Grid>
                              <Grid className='col-md-6'>
                                <div className='drp-priority'>
                                  <Grid className='assets-info-devider'>
                                    <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                      <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                        Select a Role
                                      </InputLabel>

                                      {this.checkUserRole.isManager() && (
                                        <Select native disabled value={this.state.role} fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helpertext={errorMessage.role}>
                                          <option value=''>Select a Role</option>
                                          {_.get(this, ['state', 'userRoles'], []).map((value, key) => {
                                            if (value.role_name !== 'Executive' && value.role_name !== 'SuperAdmin' && value.role_name !== 'Manager') {
                                              return (
                                                <option value={value.role_id} key={key}>
                                                  {value.role_name}
                                                </option>
                                              )
                                            }
                                          })}
                                        </Select>
                                      )}

                                      {(this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) && (
                                        <Select multiple variant='outlined' value={this.state.roleWhenAdmin} fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helpertext={errorMessage.role} MenuProps={MenuProps}>
                                          {_.get(this, ['state', 'userRoles'], []).map((value, key) => {
                                            if (value.role_name !== 'Maintenance staff' && value.role_name !== 'SuperAdmin' && value.role_name !== 'Operator') {
                                              return (
                                                <MenuItem value={value.role_id} key={key}>
                                                  {handleNewRole(value.role_name)}
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

                              {(this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) && this.state.roleWhenAdmin.length > 1 && (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority'>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a default Role
                                        </InputLabel>
                                        <Select native fullWidth name='roleDef' inputProps={{ name: 'roleDef', id: 'outlined-age-native-simple-role-def' }} onChange={e => this.handleOnchnage(e)} error={formError.role} helpertext={errorMessage.role}>
                                          {_.get(this, ['state', 'selectedRolesByAdmin'], []).map((value, key) => {
                                            return (
                                              <option value={value.role_id} key={key}>
                                                {handleNewRole(value.role_name)}
                                              </option>
                                            )
                                          })}
                                        </Select>
                                        {formError.role ? <div className={classes.validation}>{errorMessage.role}</div> : ''}
                                      </FormControl>
                                    </Grid>
                                  </div>
                                </Grid>
                              )}

                              {this.checkUserRole.isSuperAdmin() && (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority'>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a company
                                        </InputLabel>
                                        <Select native fullWidth name='company' inputProps={{ name: 'company', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.company} helperText={errorMessage.company}>
                                          <option value=''>Select a company</option>
                                          {_.get(this, ['state', 'allCompany'], []).map((value, key) => {
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

                              {this.checkUserRole.isManager() && (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority drp-multiselect' style={{ marginTop: '16px' }}>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a Facilities
                                        </InputLabel>

                                        {this.checkUserRole.currentSelectedRole(this.state.role).isOperator() || this.state.selectedRoleName.includes('Operator') || this.checkUserRole.currentSelectedRole(this.state.role).isMaintenanceStaff() ? (
                                          <Select variant='outlined' fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} value={this.state.selectedSites} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                            {this.state.site.map(
                                              value =>
                                                value.status !== 20 && (
                                                  <MenuItem key={value.site_id} value={value.site_id}>
                                                    {value.site_name}
                                                  </MenuItem>
                                                )
                                            )}
                                          </Select>
                                        ) : (
                                          <Select multiple variant='outlined' fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} value={this.state.selectedSites} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                            {this.state.site.map(
                                              value =>
                                                value.status !== 20 && (
                                                  <MenuItem key={value.site_id} value={value.site_id}>
                                                    {value.site_name}
                                                  </MenuItem>
                                                )
                                            )}
                                          </Select>
                                        )}
                                      </FormControl>
                                    </Grid>
                                  </div>
                                  {formError.selectedSites ? <div className={classes.validation}>{errorMessage.selectedSites}</div> : ''}
                                </Grid>
                              )}

                              {((this.checkUserRole.isCompanyAdmin() && !this.state.selectedRoleName.includes('Company Admin')) || (this.checkUserRole.isSuperAdmin() && !this.state.selectedRoleName.includes('Company Admin'))) && (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority drp-multiselect' style={{ marginTop: '16px' }}>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a Facilities
                                        </InputLabel>
                                        <Select multiple={!this.state.selectedRoleName.includes('Operator')} variant='outlined' fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} value={this.state.selectedSites} onChange={e => this.handleOnchnage(e)} input={<Input />} MenuProps={MenuProps}>
                                          {this.state.site.map(value => (
                                            <MenuItem key={value.site_id} value={value.site_id}>
                                              {value.site_name}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                  </div>
                                  {formError.selectedSites ? <div className={classes.validation}>{errorMessage.selectedSites}</div> : ''}
                                </Grid>
                              )}

                              {!this.state.selectedRoleName.includes('Operator') && (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority'>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a default site
                                        </InputLabel>
                                        <Select native fullWidth name='selectedDefSites' inputProps={{ name: 'selectedDefSites', id: 'outlined-age-native-simple' }} value={this.state.defaultSite} onChange={e => this.handleOnchnage(e)}>
                                          {this.state.defaultSiteOptions.length !== 0 &&
                                            this.state.defaultSiteOptions.map(value => (
                                              <option key={value.site_id} value={value.site_id}>
                                                {value.site_name}
                                              </option>
                                            ))}
                                        </Select>
                                        {formError.defaultSite ? <div className={classes.validation}>{errorMessage.defaultSite}</div> : ''}
                                      </FormControl>
                                    </Grid>
                                  </div>
                                </Grid>
                              )}

                              {this.state.role === this.state.operatorRoleId || this.state.selectedRoleName.includes('Operator') ? (
                                <Grid className='col-md-6'>
                                  <div className='drp-priority'>
                                    <Grid className='assets-info-devider'>
                                      <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                        <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                          Select a language
                                        </InputLabel>
                                        <Select native fullWidth name='language' value={this.state.language} inputProps={{ name: 'language', id: 'outlined-age-native-simple' }} onChange={e => this.handleOnchnage(e)} error={formError.language} helpertext={errorMessage.language}>
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
                              ) : (
                                ''
                              )}
                            </Grid>
                          </Grid>
                          <Grid className='assets-buttons-part user_btn_bottom'>
                            <Button disabled={this.state.selectedRoleName.length > 1 && this.state.selectedRoleName.includes('Operator') && !this.checkUserRole.isManager()} variant='contained' color='primary' disableElevation className='nf-buttons txt-normal mr-3' style={{ fontSize: '13px' }} onClick={this.createUser_}>
                              Save
                            </Button>
                            <Button variant='contained' color='primary' disableElevation className='nf-buttons txt-normal' style={{ fontSize: '13px' }} component={Link} to={'../../users'}>
                              Cancel
                            </Button>
                          </Grid>
                        </form>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {this.state.selectedRoleName.length > 1 && this.state.selectedRoleName.includes('Operator') && !this.checkUserRole.isManager() && <ErrorDiv msg={'Operator user can not have other roles assigned to it !'} />}
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}
function mapState(state) {
  //console.log('map state---------', state)
  return state
}

const actionCreators = {
  createUserAction: createUserAction,
}

CreateUser.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapState, actionCreators)(withStyles(styles)(CreateUser))
