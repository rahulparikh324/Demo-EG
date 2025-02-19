import React, { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box'
import enums from '../../Constants/enums'
import getUserRole from '../../helpers/getUserRole'
import { MinimalInput, MinimalAutoComplete, MinimalCountryCodePhoneInput } from '../Assets/components'
import Button from '@material-ui/core/Button'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import createUser from '../../Services/User/createUserService'
import { Toast } from '../../Snackbar/useToast'
import _, { isEmpty } from 'lodash'
import $ from 'jquery'
import { history } from '../../helpers/history'
import companyList from '../../Services/getAllCompany'
import { handleNewRole } from '../../helpers/handleNewRole'
import getUserDetail from '../../Services/User/getUserDetailsService'

import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import AccountBalanceOutlinedIcon from '@material-ui/icons/AccountBalanceOutlined'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'

import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import URL from 'Constants/apiUrls'
import getDomainName from 'helpers/getDomainName'

function UpdateUser({ userID }) {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const userRoles = JSON.parse(localStorage.getItem('__userRoles'))
  const checkUserRole = new getUserRole()
  const getRoleOpts = () => {
    var excludes = []
    if (checkUserRole.isManager()) excludes = ['Executive', 'SuperAdmin', 'Manager', 'Maintenance staff', 'Company Admin', 'Operator']
    else excludes = ['SuperAdmin', 'Maintenance staff', 'Operator']
    return userRoles.filter(r => !excludes.includes(r.role_name)).map(s => ({ ...s, label: handleNewRole(s.role_name), value: s.role_id }))
  }
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userName, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [mobileNumber, setMobileNumber] = useState('')
  const statusOpts = enums.userStatus.map(s => ({ ...s, label: s.status, value: s.id }))
  const [status, setStatus] = useState(enums.userStatus[0])
  const roleOpts = getRoleOpts()
  const [role, setRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState([])
  const getSiteOpts = () => {
    const { usersites, client_company } = loginData
    const sites = []
    if (!checkUserRole.isSuperAdmin())
      usersites.forEach(s => {
        const clientCompanyName = client_company.filter(d => d.client_company_id.includes(s.client_company_id))
        if (s.status !== 20) {
          sites.push({ ...s, label: `${clientCompanyName[0]?.client_company_name} -> ${s.site_name}`, value: s.site_id })
        }
      })
    const alphabeticalSites = _.orderBy(sites, [s => s.label.toLowerCase()], ['asc'])
    return alphabeticalSites
  }
  const [siteOpts, setSiteOpts] = useState(getSiteOpts())
  const [site, setSite] = useState(null)
  const [defSite, setDefSite] = useState('')
  const [defSiteOpts, setDefSiteOpts] = useState([])
  const [defRole, setDefRole] = useState('')
  const [defRoleOpts, setDefRoleOpts] = useState([])
  const langOpts = enums.Language.map(s => ({ ...s, label: s.language, value: s.id }))
  const [lang, setLang] = useState(null)
  const [errors, setErrors] = useState({})
  const [company, setCompany] = useState('')
  const [companyOptions, setCompanyOptions] = useState([])
  const [userData, setUserData] = useState({})

  const countryCodeOptions = [
    {
      id: 1,
      type: 'button',
      text: '+1',
      onClick: () => setCountryCode('+1'),
      show: true,
      seperatorBelow: URL.BASE.split('.').length !== 3,
    },
  ]

  if (URL.BASE.split('.').length !== 3 || getDomainName() === 'democompany' || getDomainName() === 'acme') {
    countryCodeOptions.push({
      id: 2,
      type: 'button',
      text: '+91',
      onClick: () => setCountryCode('+91'),
      show: true,
      seperatorBelow: false,
    })
  }

  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const response = await getUserDetail(userID)
        // console.log(response.data.data)
        setUserData(response.data.data)
        const { firstname, lastname, email, username, mobile_number, status, userroles, default_rolename_web, default_rolename_app, usersites, default_site_id } = response.data.data
        setFirstName(firstname)
        setLastName(lastname)
        setUsername(username)
        setEmail(email)
        setMobileNumber(mobile_number ? mobile_number.slice(-10) : '')
        setCountryCode(mobile_number ? mobile_number.slice(0, -10) : '+1')
        setStatus(statusOpts.find(s => s.id === status))
        //role
        const _roleIds = userroles.map(d => d.role_id)
        if (checkUserRole.isManager()) setRole(roleOpts.find(r => r.role_id === _roleIds[0]))
        else setRole(roleOpts.filter(r => _roleIds.includes(r.role_id)))
        setDefRoleOpts(roleOpts.filter(r => _roleIds.includes(r.role_id)))
        setDefRole(roleOpts.find(r => r.role_id === default_rolename_web || r.role_id === default_rolename_app))
        //site
        const _siteIds = usersites.map(d => d.site_id)
        setSite(siteOpts.filter(r => _siteIds.includes(r.site_id)))
        setDefSiteOpts(siteOpts.filter(r => _siteIds.includes(r.site_id)))
        setDefSite(siteOpts.find(r => r.site_id === default_site_id))

        if (checkUserRole.isSuperAdmin()) {
          const allCompaniesList = await companyList()
          const allCompanies = []
          allCompaniesList.data.data.forEach(comp => allCompanies.push({ ...comp, label: comp.company_name, value: comp.company_id }))
          setCompanyOptions(allCompanies)
          const comp = allCompanies.find(comp => comp.company_id === usersites[0].company_id)
          setCompany(comp)
          const siteOpts = comp.sites.map(s => ({ ...s, label: s.site_name, value: s.site_id }))
          setSiteOpts(siteOpts)
          setSite(siteOpts.filter(r => _siteIds.includes(r.site_id)))
          setDefSiteOpts(siteOpts.filter(r => _siteIds.includes(r.site_id)))
          setDefSite(siteOpts.find(r => r.site_id === default_site_id))
        }
        $('#pageLoading').hide()
      } catch (error) {
        setCompanyOptions([])
        $('#pageLoading').hide()
      }
    })()
  }, [])
  const handleFocus = name => {
    const formError = { ...errors }
    delete formError[name]
    setErrors(formError)
  }
  //
  const handleRoleChange = val => {
    setRole(val)
    // setSite(null)
    // setDefSite('')
    if (!checkUserRole.isManager()) {
      setSelectedRole(val.map(r => r.role_name))
      setDefRoleOpts(val.filter(user => user.role_name !== 'Technician'))
      if (val.map(r => r.role_name).includes('Company Admin')) {
        setSite(siteOpts)
        setDefSiteOpts(siteOpts)
        setDefSite(siteOpts[0])
      }
    }
    if (val.length === 2 && val.map(user => user.role_name).includes('Technician')) {
      const defaultRole = val.filter(r => r.role_name !== 'Technician')
      setDefRole(defaultRole[0])
    } else {
      if (val.length === 1) setDefRole(val[0])
      else {
        const rolePriorities = {
          'Company Admin': 1,
          Manager: 2,
          Executive: 3,
          Technician: 4,
        }
        const list = _.orderBy(val, [role => rolePriorities[role.role_name] || 999], ['asc'])
        setDefRole(list[0])
      }
    }
  }
  const handleSiteChange = val => {
    const sites = _.orderBy(val, [d => d.label?.toLowerCase()], 'asc')
    setSite(sites)
    setDefSiteOpts(sites)
    const newDefSite = !isEmpty(sites) && sites.some(d => d.label === defSite?.label) ? defSite : sites[0] || ''
    setDefSite(newDefSite)
  }
  const handleCompany = async company => {
    // console.log(company)
    setSiteOpts(company.sites.map(site => ({ ...site, label: site.site_name, value: site.site_id })))
    setSite([])
    setDefSite('')
    setRole([])
    setSelectedRole([])
    setCompany(company)
  }
  // console.log(defRole)
  // Validation
  const validateForm = async () => {
    const obj = {}
    if (checkUserRole.isManager()) {
      obj.ac_default_role_app = role.role_id
      obj.company = loginData.usersites[0].company_id
      obj.role = [{ role_id: role.role_id }]
      obj.site = !_.isEmpty(site) ? (obj.site = site.map(s => ({ site_id: s.site_id, status: 1, company_id: loginData.usersites[0].company_id }))) : []
    } else if (checkUserRole.isSuperAdmin()) {
      obj.ac_default_role_app = defRole.role_id
      obj.company = company.company_id
      obj.role = role ? role.map(r => ({ role_id: r.role_id })) : []
      obj.site = !_.isEmpty(site) ? (obj.site = site.map(s => ({ site_id: s.site_id, status: 1, company_id: company.company_id }))) : []
    } else {
      obj.ac_default_role_app = defRole.role_id
      obj.company = loginData.usersites[0].company_id
      obj.role = role ? role.map(r => ({ role_id: r.role_id })) : []
      if (selectedRole.includes('Operator')) !_.isEmpty(site) ? (obj.site = [{ site_id: site.site_id, status: 1, company_id: loginData.usersites[0].company_id }]) : (obj.site = [])
      else !_.isEmpty(site) ? (obj.site = site.map(s => ({ site_id: s.site_id, status: 1, company_id: loginData.usersites[0].company_id }))) : (obj.site = [])
    }
    //
    const schema = yup.object().shape({
      email: yup.string().email('Enter a valid Email !').required('Email is required !'),
      password: yup.string(),
      // username: yup
      //   .string()
      //   .required('Username is required !')
      //   .oneOf([yup.ref('email'), null], 'Username and Email must be same'),
      firstname: yup.string().required('First Name is required !'),
      lastname: yup.string().required('Last Name is required !'),
      mobile_number: loginData.is_mfa_enabled
        ? yup
            .string()
            .test('len', 'Mobile number must be 10 digits only, without the country code.', val => {
              return val.length === 10
            })
            .required('Mobile Number is required !')
        : yup
            .string()
            .nullable()
            .test('len', 'Mobile number must be 10 digits only, without the country code.', val => {
              return val == null || isEmpty(val) || val.length === 10
            }),
      ac_default_role_app: yup.string().required('Default Role is required !'),
      ac_default_role_web: yup.string().required('Default Role is required !'),
      ac_default_site: yup.string().required('Default Facility is required !'),
      ac_active_role_app: yup.string().required('Default Role is required !'),
      ac_active_role_web: yup.string().required('Default Role is required !'),
      ac_active_site: yup.string().required('Default Facility is required !'),
      status: yup.string().required('Status is required !'),
      prefer_language_id: yup.string().required('Language are required !'),
      userroles: yup.array().min(1, 'Roles are required !'),
      usersites: yup.array().min(1, 'Facilities are required !'),
      ac_default_company: yup.string().required('Company is required !'),
      ac_active_company: yup.string().required('Company is required !'),
    })
    // console.log(schema)
    const payload = {
      password: '',
      email: email.toLowerCase(),
      username: userName.toLowerCase(),
      firstname: firstName,
      lastname: lastName,
      mobile_number: mobileNumber,
      ac_default_role_app: obj.ac_default_role_app,
      ac_default_role_web: obj.ac_default_role_app,
      ac_default_site: defSite.site_id,
      ac_active_role_app: obj.ac_default_role_app,
      ac_active_role_web: obj.ac_default_role_app,
      ac_active_site: defSite.site_id,
      prefer_language_id: 1,
      status: status ? status.id : '',
      userroles: obj.role,
      usersites: obj.site,
      ac_default_company: obj.company,
      ac_active_company: obj.company,
      uuid: userData.uuid,
      requestby: loginData.uuid,
    }
    const isValid = await validateSchema(payload, schema)
    // console.log(isValid)
    if (checkUserRole.isManager()) {
      const otherErrors = { ...isValid }
      delete otherErrors['email']
      setErrors(isValid)
      if (Object.keys(otherErrors).length === 0) submitData({ ...payload, mobile_number: mobileNumber ? `${countryCode}${mobileNumber}` : null })
    } else {
      const otherErrors = { ...isValid }
      if (selectedRole.includes('Operator') && role.length === 1) {
        delete otherErrors['email']
        setErrors(isValid)
        if (Object.keys(otherErrors).length === 0) submitData({ ...payload, mobile_number: mobileNumber ? `${countryCode}${mobileNumber}` : null })
      } else {
        if (Object.keys(otherErrors).length === 0) submitData({ ...payload, mobile_number: mobileNumber ? `${countryCode}${mobileNumber}` : null })
      }
      setErrors(otherErrors)
    }
  }
  //
  const submitData = async data => {
    $('#pageLoading').show()
    try {
      const res = await createUser(data)
      // console.log('PAYLOAD', data)
      if (res.data.success === 1) {
        Toast.success('User updated successfully !')
        history.goBack()
      } else Toast.error(res.data.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }

  const handleOnChange = e => {
    if (e) {
      const num = e.replace(/\D/g, '')
      setMobileNumber(num)
    } else setMobileNumber('')
  }

  //
  return (
    <div style={{ padding: '0 20px', background: '#fff', height: '92vh' }}>
      <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 800 }}>Update User</div>
        <div className='inspection-breadcrum'>
          <ul className='bread-crum'>
            <li>
              <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, outline: 'none', background: 'transparent' }}>
                Users
              </button>
            </li>
            <li> {'>'} </li>
            <li>{userID}</li>
          </ul>
        </div>
      </Box>
      <div>
        <div style={{ background: '#fff', borderRadius: '8px', marginBottom: '18px' }}>
          <div style={{ borderRadius: '5px', border: '1px solid #dee2e6', marginBottom: '25px', transition: `box-shadow 1s` }}>
            <div className='d-flex justify-content-between align-items-center' style={{ padding: '10px 15px', background: 'rgba(0,0,0,0.03)', borderRadius: '5px 5px 0 0', borderBottom: '1px solid #dee2e6' }}>
              <div className='d-flex justify-content-between align-items-center'>
                <PersonOutlineIcon fontSize='small' />
                <strong style={{ fontSize: '14px', marginLeft: '10px' }}>User Details</strong>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', padding: '16px' }}>
              <MinimalInput onFocus={() => handleFocus('firstname')} error={errors.firstname} placeholder='Enter First Name' value={firstName} onChange={setFirstName} label='First Name' w={98} />
              <MinimalInput onFocus={() => handleFocus('lastname')} error={errors.lastname} placeholder='Enter Last Name' value={lastName} onChange={setLastName} label='Last Name' w={98} />
              {/* {!selectedRole.includes('Operator') && <MinimalInput onFocus={() => handleFocus('username')} error={errors.username} placeholder='Enter Username' value={userName} onChange={setUsername} label='Username' w={98} disabled />} */}
              {!selectedRole.includes('Operator') && <MinimalInput onFocus={() => handleFocus('email')} error={errors.email} placeholder='Enter Email' value={email} onChange={setEmail} label='Email' w={98} disabled />}
              <MinimalCountryCodePhoneInput dropDownMenuOptions={countryCodeOptions} btnText={countryCode} onFocus={() => handleFocus('mobile_number')} error={errors.mobile_number} placeholder='Enter Mobile Number' label='Mobile Number' value={mobileNumber} onChange={e => handleOnChange(e)} w={98} type='tel' />
              <FormControl component='fieldset' style={{ margin: '1px 5px 0 0px', fontSize: '14px' }}>
                <div className='minimal-input-label'>Select Status</div>
                <div className='d-flex flex-row justify-content-between align-items-center'>
                  <RadioGroup row aria-label='position' name='email-report'>
                    <FormControlLabel value={1} checked={status.id === enums.userStatus[0].id} control={<Radio color='primary' />} label='Active' className='radio-label-rep' onChange={e => setStatus(enums.userStatus[0])} />
                    <FormControlLabel value={2} checked={status.id === enums.userStatus[1].id} control={<Radio color='primary' />} label='Inactive' className='radio-label-rep' onChange={e => setStatus(enums.userStatus[1])} />
                  </RadioGroup>
                </div>
              </FormControl>
            </div>
          </div>

          <div style={{ borderRadius: '5px', border: '1px solid #dee2e6', marginBottom: '16px', transition: `box-shadow 1s` }}>
            <div className='d-flex justify-content-between' style={{ padding: '10px 15px', background: 'rgba(0,0,0,0.03)', borderRadius: '5px 5px 0 0', borderBottom: '1px solid #dee2e6' }}>
              <div className='d-flex justify-content-between align-items-center'>
                <AccountBalanceOutlinedIcon fontSize='small' />
                <strong style={{ fontSize: '14px', marginLeft: '10px' }}>Facilities Details</strong>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', padding: '16px' }}>
              {checkUserRole.isSuperAdmin() && <MinimalAutoComplete value={company} onFocus={() => handleFocus('ac_active_company')} error={errors.ac_active_company} placeholder='Select a Company' onChange={v => handleCompany(v)} options={companyOptions} label='Select Company' w={98} isDisabled />}
              <MinimalAutoComplete isMulti={!checkUserRole.isManager()} onFocus={() => handleFocus('userroles')} error={errors.userroles} placeholder='Select Role' value={role} onChange={v => handleRoleChange(v)} options={roleOpts} label='Select Role' w={98} isDisabled={checkUserRole.isManager()} />
              {selectedRole.length > 1 && !selectedRole.includes('Operator') && <MinimalAutoComplete onFocus={() => handleFocus('ac_default_role_app')} placeholder='Default Role' value={defRole} onChange={v => setDefRole(v)} options={defRoleOpts} label='Default Role' w={98} error={errors.ac_default_role_app} />}
              <MinimalAutoComplete isMulti={!selectedRole.includes('Operator')} onFocus={() => handleFocus('usersites')} error={errors.usersites} placeholder='Select a Facility' value={site} onChange={v => handleSiteChange(v)} options={siteOpts} label='Select Facility' w={98} isDisabled={selectedRole.includes('Company Admin')} />
              {!selectedRole.includes('Operator') && <MinimalAutoComplete onFocus={() => handleFocus('ac_default_site')} error={errors.ac_default_site} placeholder='Select a Default Facility' value={defSite} onChange={v => setDefSite(v)} options={defSiteOpts} label='Select Default Facility' w={98} />}
              {selectedRole.includes('Operator') && <MinimalAutoComplete onFocus={() => handleFocus('prefer_language_id')} error={errors.prefer_language_id} placeholder='Select Language' value={lang} onChange={v => setLang(v)} options={langOpts} label='Select Language' w={98} />}
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation style={{ marginRight: '15px' }}>
              Update User
            </Button>
            <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => history.push('../../users')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateUser
