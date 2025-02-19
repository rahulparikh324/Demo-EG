import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import $ from 'jquery'
import getUserDetail from '../../Services/User/getUserDetailsService'
import FormControl from '@material-ui/core/FormControl'
import enums from '../../Constants/enums'
import { formValidation, errorObject } from './validations'
import { Toast } from '../../Snackbar/useToast'
import updateUser from '../../Services/User/updateUserService'
import getUserRoles from '../../Services/User/getUserRolesService'
import { history } from '../../helpers/history'
import getUserRole from '../../helpers/getUserRole'
import companyList from '../../Services/getAllCompany'
import _ from 'lodash'
import { MinimalInput, MinimalAutoComplete } from '../Assets/components'
import { handleNewRole } from '../../helpers/handleNewRole'

const useStyles = makeStyles(theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  selectEmpty: { marginTop: theme.spacing(2) },
  validation: { color: '#f44336', fontSize: '0.75rem', margin: '0 0 0 14px', paddingTop: '4px' },
}))

function UserDetail({ parameters }) {
  const classes = useStyles()
  const checkUserRole = new getUserRole()
  const MenuProps = { PaperProps: { style: { maxHeight: 224, width: 250 } } }
  const [selectedRoleName, setSelectedRoleName] = useState('')
  const [userRoles, setUserRoles] = useState([])
  const [allCompany, setAllCompany] = useState([])
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const allSiteObject = loginData.usersites.filter(site => site.status === 20)[0]
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [uuid, setUUID] = useState('')
  const [role, setRole] = useState(checkUserRole.isSuperAdmin() || checkUserRole.isCompanyAdmin() ? [] : '')
  const [defaultRole, setDefaultRole] = useState('')
  const [defaultRoleOptions, setDefaultRoleOptions] = useState([])
  const [defaultSite, setDefaultSite] = useState('')
  const [defaultSiteOptions, setDefaultSiteOptions] = useState([])
  const [company, setCompany] = useState('')
  const [language, setLanguage] = useState('')
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState([])
  const [validationError, setValidationError] = useState(errorObject)
  const [isSelectRoleDisabled, setSelectRoleDisabled] = useState(false)
  const [isCognitoRoleDisabled, setCognitoRoleDisabledDisabled] = useState(false)

  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const response = await getUserDetail(parameters.userId)
        const _userRoles = await getUserRoles()
        const userRoles = _userRoles.data.data.list.map(role => ({ role_id: role.role_id, role_name: role.name }))
        setUserRoles(userRoles)
        // console.log(response.data.data)

        const { firstname, lastname, email, username, status, userroles, default_rolename_web, default_rolename_app, usersites, default_site_id, uuid, prefer_language_id } = response.data.data
        setFirstName(firstname)
        setLastName(lastname)
        setUserName(username)
        setEmail(email)
        setStatus(status)
        setUUID(uuid)
        default_rolename_web ? setDefaultRole(default_rolename_web) : setDefaultRole(default_rolename_app)
        const defRoleOpts = []
        userroles.forEach(element => {
          const r = userRoles.filter(role => role.role_id === element.role_id)[0]
          if (r) defRoleOpts.push(r)
        })
        // console.log(userRoles, defRoleOpts)
        setDefaultRoleOptions(defRoleOpts)
        setCompany(usersites[0].company_id)
        prefer_language_id ? setLanguage(prefer_language_id) : setLanguage(1)
        if (checkUserRole.isSuperAdmin()) {
          const allCompaniesList = await companyList()
          const allCompany = allCompaniesList.data.data
          setAllCompany(allCompaniesList.data.data)
          const selectCompany = allCompany.filter(x => x.company_id === usersites[0].company_id)
          const siteOpts = selectCompany[0].sites.map(value => ({ site_id: value.site_id, site_name: value.site_name }))
          setSites(siteOpts)
          const x = userroles.filter(Role => Role.role_id === userRoles[2].role_id || Role.role_id === userRoles[4].role_id || Role.role_id === userRoles[5].role_id)
          setRole(x.map(Role => Role.role_id))
          const __role = response.data.data.default_rolename_web || response.data.data.default_rolename_app
          if (checkUserRole.currentSelectedRole(__role).isOperator() || checkUserRole.currentSelectedRole(__role).isMaintenanceStaff()) {
            setSelectRoleDisabled(true)
            setDefaultRole(__role)
            setRole(userroles.map(Role => Role.role_id))
          }
        } else if (checkUserRole.isCompanyAdmin()) {
          const x = userroles
          setRole(x.map(Role => Role.role_id))
          setSites(loginData.usersites.filter(site => site.status !== 20))
          const __role = response.data.data.default_rolename_web || response.data.data.default_rolename_app
          if (checkUserRole.currentSelectedRole(__role).isOperator() || checkUserRole.currentSelectedRole(__role).isMaintenanceStaff()) {
            setSelectRoleDisabled(true)
            setDefaultRole(__role)
            setRole(userroles.map(Role => Role.role_id))
          }
        } else {
          const __role = userroles[0].role_id
          setRole(__role)
          if (checkUserRole.currentSelectedRole(__role).isOperator() || checkUserRole.currentSelectedRole(__role).isMaintenanceStaff()) {
            const x = userRoles.filter(Role => Role.role_name === 'Operator' || Role.role_name === 'Maintenance staff')
            setUserRoles(x)
            // console.log(x)
          }
          if (checkUserRole.currentSelectedRole(__role).isManager()) {
            setCognitoRoleDisabledDisabled(true)
          }
          setRole(userroles[0].role_id)
          setSites(loginData.usersites)
        }
        setSelectedSite(usersites.map(Site => Site.site_id))
        defRoleOpts.length === 1 ? setSelectedRoleName(defRoleOpts[0].role_name) : setSelectedRoleName(defRoleOpts.map(Role => Role.role_name))
        setDefaultSite(default_site_id)
        if (allSiteObject) {
          default_site_id === allSiteObject.site_id || usersites.length > 1 ? setDefaultSiteOptions([...usersites, allSiteObject]) : setDefaultSiteOptions(usersites)
        } else {
          setDefaultSiteOptions(usersites)
        }
        $('#pageLoading').hide()
      } catch (err) {
        console.log(err)
        Toast.error(err)
        $('#pageLoading').hide()
      }
    })()
  }, [])

  const checkForFormValidation = () => {
    const { isValid, errorObject } = formValidation(firstName, lastName, userName, email, status, role, defaultRole, company, selectedSite, defaultSite, language)
    if (isValid) {
      setValidationError(errorObject)
      updateUserDetails()
    } else if (selectedRoleName === 'Operator') {
      if (errorObject.email.error || errorObject.userName.error) {
        const errArr = []
        Object.keys(errorObject).forEach(key => {
          if (key !== 'email' && key !== 'userName') errArr.push(errorObject[key].error)
        })
        const unq = [...new Set(errArr)]
        if (unq.length === 1) {
          setValidationError(errorObject)
          updateUserDetails()
        } else {
          setValidationError(errorObject)
        }
      } else {
        setValidationError(errorObject)
      }
    } else {
      setValidationError(errorObject)
    }
  }

  const handleOnChange = e => {
    const { name, value } = e.target
    // console.log(name, value)
    if (checkUserRole.isSuperAdmin() || checkUserRole.isCompanyAdmin()) {
      if (name === 'role') {
        setRole(value)
        if (value.length === 1) setDefaultRole(value[0])
        if (value.length === 0) setDefaultRole('')
        const selectedRolesByAdmin = []
        const selectedRoleNames = []
        value.forEach(element => {
          selectedRolesByAdmin.push(userRoles.filter(role => role.role_id === element)[0])
          selectedRoleNames.push(userRoles.filter(role => role.role_id === element)[0].role_name)
        })
        setDefaultRoleOptions(selectedRolesByAdmin)
        setSelectedRoleName(selectedRoleNames)
        if (selectedRoleNames.includes('Company Admin')) {
          setSelectedSite(sites.map(s => s.site_id))
          // console.log(sites)
        }
      }
      if (name === 'company') {
        setCompany(value)
        if (value.length === 0) {
          setSites([])
          setDefaultSiteOptions([])
          setDefaultSite('')
        } else {
          const selectCompany = allCompany.filter(x => x.company_id === value)
          const siteOpts = selectCompany[0].sites.map(value => ({ site_id: value.site_id, site_name: value.site_name }))
          setSites(siteOpts)
        }
        setSelectedSite([])
      }
      if (name === 'selectedSites') {
        setSelectedSite(value)
        if (value.length === 1) setDefaultSite(value[0])
        if (value.length === 0) setDefaultSite('')
        const defOpts = []
        if (_.isArray(value)) {
          if (value.length > 1) defOpts.push(allSiteObject)
          value.forEach(element => defOpts.push(sites.filter(site => site.site_id === element)[0]))
          setDefaultSiteOptions(defOpts)
        }
      }
    } else {
      if (name === 'role') {
        setRole(value)
        const passedRoleName = value !== '' && userRoles.filter(role => role.role_id === value)[0].role_name
        // console.log(passedRoleName, selectedRoleName)
        setSelectedRoleName(passedRoleName)
        if (passedRoleName === 'Manager') {
          setSelectedSite([])
          setDefaultSiteOptions([])
          setDefaultSite('')
        }
      }
      if (name === 'selectedSites') {
        setSelectedSite(value)
        // console.log(value, 'test')
        if (value.length !== 0) {
          if (selectedRoleName === 'Manager' || selectedRoleName === 'Technician') {
            const x = []
            value.forEach(element => x.push(sites.filter(site => site.site_id === element)[0]))
            if (value.length > 1) x.push(allSiteObject)
            setDefaultSiteOptions(x)
            if (value.length === 1) setDefaultSite(value[0])
          }
        } else {
          setDefaultSiteOptions([])
          setDefaultSite('')
        }
      }
    }
  }

  const updateUserDetails = async () => {
    const userSites = []
    var isOpMs = false
    var siteId
    if (['Operator', 'Maintenance staff'].includes(selectedRoleName)) {
      siteId = Array.isArray(selectedSite) ? selectedSite[0] : selectedSite
      userSites.push({ site_id: siteId, status: parseInt(status), company_id: company })
      isOpMs = true
    } else if (selectedRoleName.includes('Company Admin')) {
      // console.log(selectedSite)
      selectedSite.forEach(item => userSites.push({ site_id: item, status: parseInt(status), company_id: company }))
    } else {
      selectedSite.forEach(item => userSites.push({ site_id: item, status: parseInt(status), company_id: company }))
    }

    const requestData = {
      requestby: loginData.uuid,
      uuid,
      email,
      username: userName,
      firstname: firstName,
      lastname: lastName,
      ac_default_role_app: defaultRole,
      ac_default_role_web: defaultRole,
      ac_default_site: isOpMs ? siteId : defaultSite,
      ac_active_role_app: defaultRole,
      ac_active_role_web: defaultRole,
      ac_active_site: isOpMs ? siteId : defaultSite,
      status: parseInt(status),
      userroles: checkUserRole.isSuperAdmin() || checkUserRole.isCompanyAdmin() ? role.map(r => ({ role_id: r })) : [{ role_id: role }],
      usersites: userSites,
      ac_default_company: company,
      ac_active_company: company,
      prefer_language_id: language ? parseInt(language) : 0,
    }
    $('#pageLoading').show()
    try {
      // console.log(requestData)
      const { success, message } = await updateUser(requestData)
      handleOnSuccess(success, message)
      $('#pageLoading').hide()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      $('#pageLoading').hide()
    }
  }

  const handleOnSuccess = (success, message) => {
    if (success > 0) {
      Toast.success(enums.resMessages.updateUser)
      setTimeout(() => history.push('../../users'), 3000)
    } else {
      Toast.error(message)
    }
  }
  return (
    <div style={{ padding: '0 20px', background: '#fff', height: '92vh' }}>
      <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>User Details</div>
        <Box className='inspection-breadcrum'>
          <ul className='bread-crum'>
            <li>
              <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, outline: 'none', background: 'transparent' }}>
                Users
              </button>
            </li>
            <li> {'>'} </li>
            <li>{parameters.userId}</li>
          </ul>
        </Box>
      </Box>
      {/* <div>
        <div style={{ padding: '18px 24px', background: '#fafafa', borderRadius: '8px', marginBottom: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
            <MinimalInput placeholder='Enter First Name' value={firstName} onChange={setFirstName} label='First Name' w={98} />
            <MinimalInput placeholder='Enter Last Name' error={validationError.lastName} value={lastName} onChange={setLastName} label='Last Name' w={98} />
          </div>
        </div>
      </div> */}
      <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-12 px-0'>
        <Grid className='assets-wrap-container padding-sections rounded-lg'>
          <Grid>
            <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
              <Grid className='assets-info-container '>
                <Grid className='row'>
                  <form>
                    <Grid className='assent-info-form-part1'>
                      <Grid className='row'>
                        <TextInputField label='First Name' value={firstName} onChange={setFirstName} errorObj={validationError.firstName} />
                        <TextInputField label='Last Name' value={lastName} onChange={setLastName} errorObj={validationError.lastName} />
                        {selectedRoleName !== 'Operator' && <TextInputField label='User Name' value={userName} onChange={setUserName} disabled errorObj={validationError.userName} />}
                        {selectedRoleName !== 'Operator' && <TextInputField label='Email' value={email} onChange={setEmail} disabled errorObj={validationError.email} />}
                        <SelectStatus />
                        <SelectRole />
                        {selectedRoleName !== 'Operator' && <SelectDefaultRole />}
                        <SelectCompany />
                        <SelectSite />
                        {selectedRoleName !== 'Operator' && <SelectDefaultSite />}
                        <SelectLanguage />
                      </Grid>
                    </Grid>

                    <Grid className='assets-buttons-part user_btn_bottom'>
                      <Button variant='contained' color='primary' disableElevation className='nf-buttons mr-3' style={{ fontSize: '13px' }} onClick={() => checkForFormValidation()}>
                        Save
                      </Button>
                      <Button variant='contained' color='primary' disableElevation className='nf-buttons' style={{ fontSize: '13px' }} component={Link} to={'../../users'}>
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
    </div>
  )

  function SelectStatus() {
    return (
      <Grid className='col-md-6'>
        <div className='drp-priority'>
          <Grid className='assets-info-devider'>
            <FormControl fullWidth variant='outlined' className={classes.formControl}>
              <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                Select a status
              </InputLabel>
              <Select native fullWidth name='status' inputProps={{ name: 'status', id: 'outlined-age-native-simple' }} value={status} onChange={e => setStatus(e.target.value)}>
                <option value=''>Select a Status</option>
                {enums.userStatus.map((value, key) => (
                  <option value={value.id} key={key}>
                    {value.status}
                  </option>
                ))}
              </Select>
              {validationError.status.error && <div className={classes.validation}>{validationError.status.msg}</div>}
            </FormControl>
          </Grid>
        </div>
      </Grid>
    )
  }

  function SelectRole() {
    return (
      <Grid className='col-md-6'>
        <div className='drp-priority select-line-height'>
          <Grid className='assets-info-devider'>
            <FormControl fullWidth variant='outlined' className={classes.formControl}>
              <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                Select a Role
              </InputLabel>
              {checkUserRole.isManager() && (
                <Select disabled value={role} native fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} onChange={e => handleOnChange(e)}>
                  <option value=''>Select a Role</option>
                  {userRoles.map((value, key) => {
                    return (
                      <option value={value.role_id} key={key}>
                        {handleNewRole(value.role_name)}
                      </option>
                    )
                  })}
                </Select>
              )}
              {checkUserRole.isSuperAdmin() && (
                <Select disabled={isSelectRoleDisabled} value={role} multiple variant='outlined' fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} MenuProps={MenuProps} onChange={e => handleOnChange(e)}>
                  {userRoles.map(value => {
                    if (isSelectRoleDisabled) {
                      if (value.role_name !== 'SuperAdmin') {
                        return (
                          <MenuItem value={value.role_id} key={value.role_id}>
                            {handleNewRole(value.role_name)}
                          </MenuItem>
                        )
                      }
                    } else {
                      if (value.role_name !== 'Operator' && value.role_name !== 'Maintenance staff' && value.role_name !== 'SuperAdmin') {
                        return (
                          <MenuItem value={value.role_id} key={value.role_id}>
                            {handleNewRole(value.role_name)}
                          </MenuItem>
                        )
                      }
                    }
                  })}
                </Select>
              )}
              {checkUserRole.isCompanyAdmin() && (
                <Select disabled={isSelectRoleDisabled} value={role} multiple variant='outlined' fullWidth name='role' inputProps={{ name: 'role', id: 'outlined-age-native-simple' }} MenuProps={MenuProps} onChange={e => handleOnChange(e)}>
                  {userRoles.map(value => {
                    if (isSelectRoleDisabled) {
                      if (value.role_name !== 'SuperAdmin' && value.role_name !== 'CompanyAdmin') {
                        return (
                          <MenuItem value={value.role_id} key={value.role_id}>
                            {handleNewRole(value.role_name)}
                          </MenuItem>
                        )
                      }
                    } else {
                      if (value.role_name !== 'Operator' && value.role_name !== 'Maintenance staff' && value.role_name !== 'SuperAdmin' && value.role_name !== 'CompanyAdmin') {
                        return (
                          <MenuItem value={value.role_id} key={value.role_id}>
                            {handleNewRole(value.role_name)}
                          </MenuItem>
                        )
                      }
                    }
                  })}
                </Select>
              )}
              {validationError.role.error && <div className={classes.validation}>{validationError.role.msg}</div>}
            </FormControl>
          </Grid>
        </div>
      </Grid>
    )
  }

  function SelectDefaultRole() {
    return (
      (checkUserRole.isSuperAdmin() || checkUserRole.isCompanyAdmin()) && (
        <Grid className='col-md-6'>
          <div className='drp-priority'>
            <Grid className='assets-info-devider'>
              <FormControl fullWidth variant='outlined' className={classes.formControl}>
                <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                  Select a default Role
                </InputLabel>
                <Select disabled={isSelectRoleDisabled} value={defaultRole} onChange={e => setDefaultRole(e.target.value)} native fullWidth name='roleDef' inputProps={{ name: 'roleDef', id: 'outlined-age-native-simple-role-def' }}>
                  {defaultRoleOptions.map((value, key) => {
                    if (isSelectRoleDisabled) {
                      if (value.role_name !== 'SuperAdmin') {
                        return (
                          <option value={value.role_id} key={value.role_id}>
                            {handleNewRole(value.role_name)}
                          </option>
                        )
                      }
                    } else {
                      if (value && value.role_name !== 'Operator' && value.role_name !== 'Maintenance staff' && value.role_name !== 'SuperAdmin') {
                        return (
                          <option value={value.role_id} key={key}>
                            {handleNewRole(value.role_name)}
                          </option>
                        )
                      }
                    }
                  })}
                </Select>
                {validationError.defaultRole.error && <div className={classes.validation}>{validationError.defaultRole.msg}</div>}
              </FormControl>
            </Grid>
          </div>
        </Grid>
      )
    )
  }

  function SelectCompany() {
    return (
      checkUserRole.isSuperAdmin() && (
        <Grid className='col-md-6'>
          <div className='drp-priority'>
            <Grid className='assets-info-devider'>
              <FormControl fullWidth variant='outlined' className={classes.formControl}>
                <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                  Select a company
                </InputLabel>
                <Select disabled value={company} native fullWidth name='company' inputProps={{ name: 'company', id: 'outlined-age-native-simple' }} onChange={e => handleOnChange(e)}>
                  <option value=''>Select a company</option>
                  {allCompany.map((value, key) => {
                    return (
                      <option value={value.company_id} key={key}>
                        {value.company_name}
                      </option>
                    )
                  })}
                </Select>
                {validationError.company.error && <div className={classes.validation}>{validationError.company.msg}</div>}
              </FormControl>
            </Grid>
          </div>
        </Grid>
      )
    )
  }

  function SelectSite() {
    return (
      (checkUserRole.isCompanyAdmin() || (checkUserRole.isSuperAdmin() && !selectedRoleName.includes('Company Admin')) || checkUserRole.isManager()) && (
        <Grid className='col-md-6'>
          <div className='drp-priority drp-multiselect' style={{ marginTop: '16px' }}>
            <Grid className='assets-info-devider'>
              <FormControl fullWidth variant='outlined' className={classes.formControl + ' mr0'}>
                <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simplemultiselect' className='input-lbl-drp'>
                  Select a site
                </InputLabel>
                {selectedRoleName === 'Operator' || selectedRoleName === 'Maintenance staff' || selectedRoleName.includes('Operator') ? (
                  <Select variant='outlined' onChange={e => handleOnChange(e)} value={selectedSite} fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} input={<Input />} MenuProps={MenuProps}>
                    {sites.map(
                      value =>
                        value.status !== 20 && (
                          <MenuItem key={value.site_id} value={value.site_id}>
                            {value.site_name}
                          </MenuItem>
                        )
                    )}
                  </Select>
                ) : (
                  <Select multiple disabled={selectedRoleName.includes('Company Admin')} variant='outlined' onChange={e => handleOnChange(e)} value={selectedSite} fullWidth name='selectedSites' inputProps={{ name: 'selectedSites', id: 'outlined-age-native-simple' }} input={<Input />} MenuProps={MenuProps}>
                    {sites.map(
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
          {validationError.site.error && <div className={classes.validation}>{validationError.site.msg}</div>}
        </Grid>
      )
    )
  }

  function SelectDefaultSite() {
    return (
      <Grid className='col-md-6'>
        <div className='drp-priority'>
          <Grid className='assets-info-devider'>
            <FormControl fullWidth variant='outlined' className={classes.formControl}>
              <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                Select a default site
              </InputLabel>
              <Select value={defaultSite} onChange={e => setDefaultSite(e.target.value)} native fullWidth name='selectedDefSites' inputProps={{ name: 'selectedDefSites', id: 'outlined-age-native-simple' }}>
                {defaultSiteOptions.map(value => {
                  if (defaultSiteOptions.length === 0) return
                  return (
                    <option key={value.site_id} value={value.site_id}>
                      {value.site_name}
                    </option>
                  )
                })}
              </Select>
            </FormControl>
            {validationError.defaultSite.error && <div className={classes.validation}>{validationError.defaultSite.msg}</div>}
          </Grid>
        </div>
      </Grid>
    )
  }

  function SelectLanguage() {
    return (
      selectedRoleName === enums.userRoles[2].role && (
        <Grid className='col-md-6'>
          <div className='drp-priority'>
            <Grid className='assets-info-devider'>
              <FormControl fullWidth variant='outlined' className={classes.formControl}>
                <InputLabel style={{ background: '#eee', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                  Select a language
                </InputLabel>
                <Select native fullWidth name='language' value={language} inputProps={{ name: 'language', id: 'outlined-age-native-simple' }} onChange={e => setLanguage(e.target.value)}>
                  <option value=''>Select a language</option>
                  {enums.Language.map((value, key) => {
                    return (
                      <option value={value.id} key={key}>
                        {value.language}
                      </option>
                    )
                  })}
                </Select>
                {validationError.language.error && <div className={classes.validation}>{validationError.language.msg}</div>}
              </FormControl>
            </Grid>
          </div>
        </Grid>
      )
    )
  }
}

function TextInputField({ value, onChange, label, disabled, errorObj }) {
  const { error, msg } = errorObj
  return (
    <Grid className='col-md-6'>
      <Grid className='assets-info-devider'>
        <TextField variant='outlined' margin='normal' fullWidth label={label} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} helperText={msg} error={error} />
      </Grid>
    </Grid>
  )
}

export default UserDetail
