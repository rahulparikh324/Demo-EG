import React from 'react'
import Button from '@material-ui/core/Button'
import $ from 'jquery'
import { get } from 'lodash'
import enums from '../../Constants/enums'
import { Link } from 'react-router-dom'
import { Toast } from '../../Snackbar/useToast'
import getUserRole from '../../helpers/getUserRole'
import updateUser from '../../Services/User/updateUserService'
import { MinimalInput, MinimalAutoComplete } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import { handleNewRole } from '../../helpers/handleNewRole'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const _styles = {
  labelStyle: { fontWeight: 800, color: '#a1a1a1' },
  labelError: { fontWeight: 800, color: 'red' },
  labelEnable: { fontWeight: 800 },
  inputEnable: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1', color: '#a1a1a1' },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

class Profile extends React.Component {
  constructor(props) {
    super(props)
    this.checkUserRole = new getUserRole()
    var logindata = localStorage.getItem('loginData')

    this.state = {
      loginData: JSON.parse(logindata),
      name: '',
      email: '',
      password: '',
      status: '',
      role: [],
      company: null,
      defaultSite: null,
      defaultSiteOptions: [],
      selectedSites: [],
      site: [],
      formError: {},
      errorMessage: {},
      allCompany: [],
      userRoles: [],
      fname: '',
      lname: '',
      tostMsg: {},
      selectedRole: [],
      AllRoles: [],
    }
    this.updateUser = this.updateUser.bind(this)
  }

  async componentDidMount() {
    $('#pageLoading').show()
    const loginData = JSON.parse(localStorage.getItem('loginData'))
    var selectedSites = []
    var allSites = []

    if (this.checkUserRole.isSuperAdmin()) {
      this.setState({ company: { company_id: loginData.usersites[0].company_id } })
    } else {
      const sites = loginData.usersites.filter(site => site.status !== 20)
      allSites = sites.map(site => ({ ...site, label: site.site_name, value: site.site_id }))
      selectedSites = [...allSites]
      const allCompany = []
      allCompany.push({ company_id: allSites[0].company_id, company_name: allSites[0].company_name, value: allSites[0].company_id, label: allSites[0].company_name })
      this.setState({ allCompany, company: allCompany[0] })
    }
    const statusOptions = enums.userStatus.map(st => ({ ...st, label: st.status, value: st.id }))

    this.setState({
      fname: loginData.firstname,
      lname: loginData.lastname,
      name: loginData.username,
      email: loginData.email,
      status: statusOptions.find(d => d.id === loginData.status),
      userRoles: loginData.userroles.map(role => ({ ...role, label: handleNewRole(role.role_name), value: role.role_id })),
      role: loginData.userroles.map(role => ({ ...role, label: handleNewRole(role.role_name), value: role.role_id, isFixed: true })),
      selectedSites,
      site: allSites,
      defaultSiteOptions: allSites,
      statusOptions,
      defaultSite: allSites.find(d => d.site_id === getApplicationStorageItem('siteId')),
    })
    $('#pageLoading').hide()
  }

  async updateUser() {
    var loginData = JSON.parse(localStorage.getItem('loginData'))
    const defaultSite = get(this.state.defaultSite, 'site_id', '')
    var formvalid = await this.formValidation(this.state.fname, this.state.lname, this.state.selectedSites, defaultSite)

    if (formvalid === true) {
      var userSites = this.state.selectedSites.map(item => ({
        site_id: item.site_id,
        status: parseInt(this.state.status.id),
        company_id: this.state.loginData.usersites[0].company_id,
      }))

      var requestData = {
        requestby: loginData.uuid,
        uuid: loginData.uuid,
        email: this.state.email,
        username: this.state.name,
        firstname: this.state.fname,
        lastname: this.state.lname,
        ac_default_role_app: localStorage.getItem('roleId'),
        ac_default_role_web: localStorage.getItem('roleId'),
        ac_default_site: defaultSite,
        ac_active_role_app: localStorage.getItem('roleId'),
        ac_active_role_web: localStorage.getItem('roleId'),
        ac_active_site: defaultSite,
        prefer_language_id: 1,
        status: parseInt(this.state.status.id),
        userroles: this.state.role.map(r => ({ role_id: r.role_id })),
        usersites: userSites,
        ac_default_company: this.state.company.company_id,
        ac_active_company: this.state.company.company_id,
      }
      //console.log(requestData)

      $('#pageLoading').show()
      try {
        const { success } = await updateUser(requestData)
        if (success > 0) Toast.success(enums.resMessages.updateProfile)
        else Toast.error('Something went wrong !')
        $('#pageLoading').hide()
      } catch (error) {
        console.log(error)
        Toast.error('Something went wrong !')
        $('#pageLoading').hide()
      }
    }
  }

  onFocus = e => this.setState({ formError: { ...this.state.formError, [e]: null } })
  onSiteChange = sites => this.setState({ selectedSites: sites, defaultSiteOptions: sites, defaultSite: '' })

  async formValidation(fname, lname, sites, defaultSite) {
    const schema = yup.object().shape({
      fname: yup.string().required('First Name is required !'),
      lname: yup.string().required('Last Name is required !'),
      sites: yup.array().min(1, 'Facilities are required !'),
      defaultSite: yup.string().required('Default Facility is required !'),
    })
    const payload = { fname, lname, sites, defaultSite }
    const isValid = await validateSchema(payload, schema)
    this.setState({ formError: isValid })
    return isValid
  }

  render() {
    return (
      <div style={{ padding: '20px', background: '#fff', height: '92vh' }}>
        <div style={{ padding: '18px 24px', background: '#fafafa', borderRadius: '8px', marginBottom: '18px' }}>
          <div className='d-flex justify-content-between'>
            <div style={{ width: '49%' }}>
              <MinimalInput value={this.state.fname} onFocus={() => this.onFocus('fname')} error={this.state.formError.fname} onChange={e => this.setState({ fname: e })} label='First Name' w={100} labelStyles={_styles.labelEnable} InputStyles={_styles.inputEnable} />
              <MinimalInput value={this.state.name} label='Username' w={100} labelStyles={_styles.labelStyle} InputStyles={_styles.inputStyle} disabled />
              <MinimalAutoComplete isDisabled value={this.state.status} options={this.state.statusOptions} label='Status' w={100} labelStyles={_styles.labelStyle} inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }} />
              {!this.checkUserRole.isSuperAdmin() && <MinimalAutoComplete isDisabled value={this.state.company} options={this.state.allCompany} label='Company' w={100} labelStyles={_styles.labelStyle} inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }} />}
              {!this.checkUserRole.isSuperAdmin() && <MinimalAutoComplete onChange={value => this.setState({ defaultSite: value })} onFocus={() => this.onFocus('defaultSite')} error={this.state.formError.defaultSite} value={this.state.defaultSite} options={this.state.defaultSiteOptions} label='Default Facility' w={100} />}
            </div>
            <div style={{ width: '49%' }}>
              <MinimalInput value={this.state.lname} onFocus={() => this.onFocus('lname')} error={this.state.formError.lname} onChange={e => this.setState({ lname: e })} label='Last Name' w={100} labelStyles={_styles.labelEnable} InputStyles={_styles.inputEnable} />
              <MinimalInput value={this.state.email} label='Email' w={100} labelStyles={_styles.labelStyle} InputStyles={_styles.inputStyle} disabled />
              <MinimalAutoComplete isMulti isDisabled value={this.state.role} options={this.state.userRoles} label='Role' w={100} labelStyles={_styles.labelStyle} inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }} />
              {!this.checkUserRole.isSuperAdmin() && <MinimalAutoComplete isMulti isDisabled onChange={value => this.onSiteChange(value)} onFocus={() => this.onFocus('sites')} error={this.state.formError.sites} value={this.state.selectedSites} options={this.state.site} label='Facilities' w={100} />}
            </div>
          </div>
          <div>
            <Button variant='contained' color='primary' disableElevation className='nf-buttons txt-normal mr-2' style={{ fontSize: '13px' }} onClick={this.updateUser}>
              Update Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Profile
