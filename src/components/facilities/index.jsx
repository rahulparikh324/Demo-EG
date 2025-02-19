import React, { useState, useContext, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'

import { ItemContainer, Section, EmptySection } from 'components/preventative-maintenance/common/components'
import { StatusComponent } from 'components/common/others'

import enums from 'Constants/enums'

import { get, isEmpty, orderBy } from 'lodash'

import facilities from 'Services/facilities/index'
import { Toast } from 'Snackbar/useToast'

import AddClientCompany from './add-client-company'
import AddSites from './add-sites'
import ViewComapny from './view-company'
import $ from 'jquery'
import updateActiveSiteAction from 'Actions/updateActiveSiteAction'
import updateClientCompany from 'Services/updateClientCompany'
import UpdateActiveSiteService from 'Services/UpdateActiveSiteService'

import { MainContext } from 'components/Main/provider'
import { camelizeKeys } from 'helpers/formatters'
import getActiveUserSitesAndRoles from 'Services/facilities/get-usersites-roles'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import getUserRole from 'helpers/getUserRole'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'

const Facilities = () => {
  const [sites, setSites] = useState([])
  const [siteDetails, setSiteDetails] = useState([])
  const [isOpenAddClientCompany, setOpenAddClientCompany] = useState(false)
  const [isOpenEditClientCompany, setOpenEditClientCompany] = useState(false)
  const [isOpenAddSite, setOpenAddSite] = useState(false)
  const [isOpenEditSite, setOpenEditSite] = useState(false)
  const [isOpenViewCompany, setOpenViewCompany] = useState(false)
  const [activeClientCompanyId, setActiveClientCompanyId] = useState('')
  const [activeSiteId, setActiveSiteId] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [isAfterFiter, setAfterFilter] = useState(false)
  const [isPreviewOpen, setPreview] = useState(false)
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const { setLoginSiteData, loginSiteData, setRefetchAppMenuContext } = useContext(MainContext)
  const checkUserRole = new getUserRole()

  const noSitesMsg = (
    <>
      No sites in this company , <br /> click new to add sites
    </>
  )

  const emplySitesMessage = isEmpty(activeClientCompanyId) ? 'No company selected' : noSitesMsg

  const afterSite = clientCompanies => {
    const company = clientCompanies.find(d => d.clientCompanyId === activeClientCompanyId)
    const sites = company.listOfSite
    setSites(sites)
    const siteList = sites.find(d => d.siteId === activeSiteId)
    setSiteDetails(siteList)
    setAfterFilter(false)
    return clientCompanies
  }

  const { initialLoading: companyLoading, data: clientCompanies, reFetch } = useFetchData({ fetch: facilities.company.get, payload: { companyId: getApplicationStorageItem('companyId'), pageindex: 0, pagesize: 0, searchString: '' }, formatter: d => (isAfterFiter ? afterSite(get(d, 'data.list', [])) : get(d, 'data.list', [])), defaultValue: [] })

  // change site
  const handleSiteRadioClick = ({ siteId, siteName }, accessibleSites) => {
    $('#pageLoading').show()
    updateActiveSiteAction({ site_id: siteId })
      .then(response => {
        localStorage.setItem('siteId', siteId)
        localStorage.setItem('siteName', siteName)
        sessionStorage.setItem('siteId', siteId)
        sessionStorage.setItem('siteName', siteName)
        setLoginSiteData(prevState => ({
          ...prevState,
          siteName: siteName,
          activeSiteId: siteId,
          accessibleSites,
        }))
        $('#pageLoading').hide()
        Toast.success(' The current site is inactive and has been changed. You will be redirected to an active site.')
      })
      .catch(error => {
        $('#pageLoading').hide()
        Toast.error(error.tostMsg.msg)
      })
  }

  // change compnay
  const changeClientCompany = async comp => {
    $('#pageLoading').show()
    try {
      const { siteId, siteName } = comp.clientCompanyUsersites[0]
      const cc = await updateClientCompany({ company_id: comp.clientCompanyId, site_id: siteId })
      const ac = await UpdateActiveSiteService({ site_id: siteId })

      Toast.success('The current client company is inactive and has been changed. You will be redirected to an active client company.')

      setLoginSiteData(prevState => ({
        ...prevState,
        accessibleSites: comp.clientCompanyUsersites,
        activeClientCompanyId: comp.clientCompanyId,
        clientCompanyName: comp.clientCompanyName,
        siteName: siteName,
      }))

      localStorage.setItem('clientCompanyName', comp.clientCompanyName)
      localStorage.setItem('siteId', siteId)
      localStorage.setItem('siteName', siteName)
      localStorage.setItem('activeClientCompanyId', comp.clientCompanyId)
      sessionStorage.setItem('clientCompanyName', comp.clientCompanyName)
      sessionStorage.setItem('siteId', siteId)
      sessionStorage.setItem('siteName', siteName)
      sessionStorage.setItem('activeClientCompanyId', comp.clientCompanyId)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong!')
    }
    $('#pageLoading').hide()
  }

  const companyMenuOptions = [
    { id: 1, name: 'View', action: d => viewCompany(d) },
    { id: 2, name: 'Edit', action: d => editCompany(d) },
  ]

  const onClientCompanyClick = (id, listOfSite) => {
    setActiveClientCompanyId(id)
    setSites(listOfSite)
    setActiveSiteId('')
  }

  const onSiteClick = val => {
    setActiveSiteId(val.siteId)
    setSiteDetails(val)
  }

  const editCompany = data => {
    setAnchorObj(data)
    setOpenEditClientCompany(true)
  }

  const viewCompany = data => {
    setOpenViewCompany(true)
    setAnchorObj(data)
  }

  const editSite = () => {
    setAnchorObj(siteDetails)
    setOpenEditSite(true)
    setAfterFilter(true)
  }

  const getStatus = status => {
    const statusLabel = enums.USER_STATUS_CHIPS.find(d => d.value === status)
    return statusLabel ? <StatusComponent color={statusLabel?.color} label={statusLabel?.label} size='small' /> : 'N/A'
  }

  const parse = key => get(siteDetails, [key], 'N/A') || 'N/A'

  const handleSiteAdd = () => {
    setOpenAddSite(true)
    setAfterFilter(true)
  }

  const reFetchFacilityData = async () => {
    reFetch()
    if (checkUserRole.isSuperAdmin()) {
      setRefetchAppMenuContext(true)
      localStorage.setItem('headerDataUpdate', Date.now())
    } else {
      await getUserFacilitiesData()
    }
  }

  const getUserFacilitiesData = async () => {
    try {
      const res = await getActiveUserSitesAndRoles(get(loginData, 'uuid', ''))
      if (res.success > 0) {
        const data = camelizeKeys(res.data)
        const clientCompany = get(data, 'clientCompany', []).find(d => d.clientCompanyId === getApplicationStorageItem('activeClientCompanyId'))
        const clientCompanyUsersites = !isEmpty(clientCompany) > 0 ? clientCompany.clientCompanyUsersites : []
        const currentActiveSite = clientCompanyUsersites.find(e => e.siteId === getApplicationStorageItem('siteId'))

        setLoginSiteData(prevState => {
          const updatedLoginSiteData = {
            ...prevState,
            defaultSiteName: get(data, 'defaultSiteName', ''),
            companyName: get(prevState, 'companyName', localStorage.getItem('companyName')),
            defaultCompanyName: get(prevState, 'defaultCompanyName', localStorage.getItem('defaultCompanyName')),
            userroles: get(data, 'userroles', []),
            client_company: get(data, 'clientCompany', []),
            accessibleSites: clientCompanyUsersites,
            activeClientCompanyId: get(clientCompany, 'clientCompanyId', prevState.activeClientCompanyId),
            clientCompanyName: get(clientCompany, 'clientCompanyName', prevState.clientCompanyName),
            activeSiteId: get(currentActiveSite, 'siteId', prevState.activeSiteId),
            siteName: get(currentActiveSite, 'siteName', prevState.siteName),
          }

          // // Update session storage
          Object.keys(updatedLoginSiteData).forEach(key => {
            sessionStorage.setItem(key, JSON.stringify(updatedLoginSiteData[key]))
          })
          sessionStorage.setItem('siteId', get(currentActiveSite, 'siteId', prevState.activeSiteId))
          //need to update localstorage as well due to when do open in new tab its taking new context state which will default take from localstorage
          localStorage.setItem('clientCompanyName', get(clientCompany, 'clientCompanyName', prevState.clientCompanyName))
          localStorage.setItem('activeClientCompanyId', get(clientCompany, 'clientCompanyId', prevState.activeClientCompanyId))
          localStorage.setItem('siteId', get(currentActiveSite, 'siteId', prevState.activeSiteId))
          localStorage.setItem('siteName', get(currentActiveSite, 'siteName', prevState.siteName))

          if (!isEmpty(clientCompanyUsersites) && !clientCompanyUsersites.some(e => e.siteId === updatedLoginSiteData.activeSiteId)) {
            handleSiteRadioClick(clientCompanyUsersites[0], clientCompanyUsersites)
          }
          if (isEmpty(clientCompany)) {
            changeClientCompany(get(data, 'clientCompany', [])[0])
          }

          if (!isEmpty(get(res, 'data.client_company', [])) || !isEmpty(get(res, 'data.usersites', []))) {
            // console.log('client company data - ', get(res, 'data.client_company', []))
            // console.log('site data - ', get(res, 'data.usersites', []))
            const loginData = JSON.parse(localStorage.getItem('loginData'))
            const updatedLoginData = {
              ...loginData,
            }
            if (!isEmpty(get(res, 'data.client_company', []))) {
              updatedLoginData.client_company = get(res, 'data.client_company', [])
            }
            if (!isEmpty(get(res, 'data.usersites', []))) {
              updatedLoginData.usersites = get(res, 'data.usersites', [])
            }
            localStorage.setItem('loginData', JSON.stringify(updatedLoginData))
          }
          localStorage.setItem('headerDataUpdate', Date.now())

          return updatedLoginSiteData
        })
      } else {
        Toast.error(res.message)
      }
    } catch (error) {
      console.log('error - ', error)
      Toast.error('Something went wrong !')
    }
  }

  const handleManagers = data => {
    return !isEmpty(data)
      ? data?.map(d => (
          <div className='mr-1 mb-2'>
            <StatusComponent color='#848484' label={d.name} size='small' />
          </div>
        ))
      : 'N/A'
  }
  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)' }}>
      <div className='d-flex' style={{ height: '100%' }}>
        {/* COMPANIES */}
        <Section loading={companyLoading} title='Client Companies' onAction={() => setOpenAddClientCompany(true)}>
          {!isEmpty(clientCompanies) &&
            orderBy(clientCompanies, [e => e.clientCompanyName.toLowerCase()], ['asc'])?.map(company => (
              <ItemContainer
                id={company.clientCompanyId}
                onClick={() => onClientCompanyClick(company.clientCompanyId, company.listOfSite)}
                data={company}
                count={company.listOfSite.length}
                hasMenu
                menuOptions={companyMenuOptions}
                key={company.clientCompanyId}
                isActive={company.clientCompanyId === activeClientCompanyId}
                title={company.clientCompanyName}
              />
            ))}
        </Section>
        {/* SITES */}
        <Section loading={companyLoading} isActionDisabled={isEmpty(activeClientCompanyId)} title='Facilities' onAction={handleSiteAdd}>
          {isEmpty(sites) ? <EmptySection message={emplySitesMessage} /> : orderBy(sites, [e => e.siteName.toLowerCase()], ['asc']).map(site => <ItemContainer id={site.siteId} onClick={() => onSiteClick(site)} key={site.siteId} isActive={site.siteId === activeSiteId} title={site.siteName} hideCount={false} />)}
        </Section>
        {/* SITES DETAILS */}
        <Section style={{ width: 'calc(100vw - 500px)' }} isActionDisabled={isEmpty(activeSiteId)} title='Facilities Details' onAction={editSite} isEditIcon>
          {isEmpty(activeSiteId) ? (
            <EmptySection message='No Facilities Selected' />
          ) : (
            <div className='p-2' style={{ height: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '25% 75%', rowGap: '24px' }}>
                <div className='text-bold'>Site Name</div>
                <div>{parse('siteName')}</div>
                <div className='text-bold'>Site Code</div>
                <div>{parse('siteCode')}</div>
                <div className='text-bold'>Status</div>
                <div>{getStatus(siteDetails.status)}</div>
                <div className='text-bold'>Project Managers</div>
                <div className='d-flex flex-wrap'>{handleManagers(siteDetails.siteProjectmanagerList)}</div>
                <div className='text-bold'>Customer</div>
                <div>{parse('customer')}</div>
                <div className='text-bold'>Customer Address</div>
                <div>{parse('customerAddress')}</div>
                <div className='text-bold'>Is Allowed to Add Asset Class?</div>
                <div>{siteDetails.isAddAssetClassEnabled === true ? 'Yes' : 'No'}</div>
                <div className='text-bold'>Site Photo</div>
                {siteDetails.profileImage != null && <AssetImage readOnly url={siteDetails.profileImage} onClick={() => setPreview(true)} />}
              </div>
            </div>
          )}
        </Section>
      </div>
      {isPreviewOpen && <ImagePreview open={isPreviewOpen} onClose={() => setPreview(false)} imageIndex={0} images={[{ imageFileNameUrl: siteDetails.profileImage }]} urlKey='imageFileNameUrl' hideRotateButton={true} />}
      {isOpenAddClientCompany && <AddClientCompany open={isOpenAddClientCompany} onClose={() => setOpenAddClientCompany(false)} reFetch={reFetchFacilityData} />}
      {isOpenEditClientCompany && <AddClientCompany open={isOpenEditClientCompany} onClose={() => setOpenEditClientCompany(false)} reFetch={reFetchFacilityData} isEdit anchorObj={anchorObj} />}
      {isOpenAddSite && <AddSites open={isOpenAddSite} onClose={() => setOpenAddSite(false)} reFetch={reFetchFacilityData} clientCompanyId={activeClientCompanyId} />}
      {isOpenEditSite && <AddSites open={isOpenEditSite} onClose={() => setOpenEditSite(false)} reFetch={reFetchFacilityData} anchorObj={anchorObj} clientCompanyId={activeClientCompanyId} isEdit />}
      {isOpenViewCompany && <ViewComapny open={isOpenViewCompany} onClose={() => setOpenViewCompany(false)} anchorObj={anchorObj} />}
    </div>
  )
}

export default Facilities
