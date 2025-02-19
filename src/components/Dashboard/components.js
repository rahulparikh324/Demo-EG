import React, { useCallback, useEffect, useState, useContext } from 'react'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import SettingsIcon from '@material-ui/icons/Settings'
import Paper from '@material-ui/core/Paper'
import { PieChart, Pie, Cell, Sector } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import getPieChartCount from '../../Services/FormIO/getPieChartCount'
import getMetricCounts from '../../Services/FormIO/getMetricCounts'
import _ from 'lodash'
import CircularProgress from '@material-ui/core/CircularProgress'
import { history } from '../../helpers/history'
import enums from 'Constants/enums'
// import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'
// import NoteIcon from '@material-ui/icons/Note'
import getUserRole from 'helpers/getUserRole'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import RecentActorsOutlinedIcon from '@material-ui/icons/RecentActorsOutlined'
import { get, isEmpty } from 'lodash'
import useFetchData from 'hooks/fetch-data'
import notification from 'Services/notification'
import facilities from 'Services/facilities/index'
import { MainContext } from 'components/Main/provider'
import $ from 'jquery'
import updateActiveSiteAction from 'Actions/updateActiveSiteAction'
import updateClientCompany from 'Services/updateClientCompany'
import UpdateActiveSiteService from 'Services/UpdateActiveSiteService'
import { Toast } from 'Snackbar/useToast'
import getActiveUserSitesAndRoles from 'Services/facilities/get-usersites-roles'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { camelizeKeys } from 'helpers/formatters'

// import AppsOutlined from '@material-ui/icons/AppsOutlined'

const styles = {
  container: { display: 'flex', height: '16%', marginBottom: '15px', justifyContent: 'space-between' },
}

const Metric = ({ count, title, onClick, icon, noCount }) => {
  const theme = useTheme()
  return (
    <div onClick={onClick} className='d-flex flex-column justify-content-between' style={{ width: '32%', cursor: 'pointer', height: '100%', background: '#fff', position: 'relative', padding: '20px', borderRadius: '4px' }}>
      <div style={{ fontWeight: 800, fontSize: '16px' }}>{title}</div>
      {!noCount ? (
        <div className='d-flex justify-content-between align-items-center'>
          {count !== undefined ? <div style={{ fontSize: '28px', color: theme.palette.primary.main, fontWeight: 800 }}>{count}</div> : <CircularProgress size={20} thickness={5} />}
          <span style={{ background: `${theme.palette.primary.main}55`, padding: '8px', borderRadius: '100px' }}>{icon ? icon : <ArrowForwardIosIcon fontSize='small' style={{ color: theme.palette.primary.main }} />}</span>
        </div>
      ) : (
        <span style={{ background: `${theme.palette.primary.main}55`, padding: '8px', borderRadius: '100px', width: '36px', position: 'absolute', bottom: '18px', right: '10px' }}>{icon ? icon : <ArrowForwardIosIcon fontSize='small' style={{ color: theme.palette.primary.main }} />}</span>
      )}
    </div>
  )
}

export const NewDashboardMertics = () => {
  const theme = useTheme()
  const [data, setData] = useState({})
  const checkUserRole = new getUserRole()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getMetricCounts()
        const metrics = res.data
        if (!_.isEmpty(metrics)) setData(res.data)
        else throw 'Error'
      } catch (error) {
        setData({
          maintainance_request_count: 'NA',
          test_report_count: 'NA',
          asset_count: 'NA',
        })
      }
    })()
  }, [])
  const clickedOnEq = () => history.push(`/assets`)

  const clickedOnIssues = () => {
    const openStatus = enums.WO_STATUS.find(d => d.value === enums.woTaskStatus.Open)
    history.push({ pathname: `/issues`, state: { filter: get(openStatus, 'label', '') } })
  }
  const clickedOnPMItems = () => {
    if (!checkUserRole.isExecutive()) history.push({ pathname: `/preventative-maintenance`, state: [enums.PM.STATUS.OVERDUE] })
  }
  //const clickedOnServices = () => history.push(`/maintenance-requests`)

  return (
    <div style={styles.container}>
      <Metric onClick={clickedOnEq} title='Assets' count={data.asset_count} icon={<SettingsIcon fontSize='small' style={{ color: theme.palette.primary.main }} />} />
      <Metric onClick={clickedOnIssues} title='Open Issues' count={data.open_asset_issue_count} icon={<ReportProblemOutlinedIcon fontSize='small' style={{ color: theme.palette.primary.main }} />} />
      <Metric onClick={clickedOnPMItems} title='Overdue PM items' count={data.overdue_asset_pm_count} icon={<RecentActorsOutlinedIcon fontSize='small' style={{ color: theme.palette.primary.main }} />} />
    </div>
  )
}

export const AssetStates = () => {
  const { setNotificationsCount, setLoginSiteData } = useContext(MainContext)
  const theme = useTheme()
  const loginData = JSON.parse(localStorage.getItem('loginData'))

  const RADIAN = Math.PI / 180
  const CHART_WIDTH = window.innerWidth * 0.265 - 32
  const CHART_HEIGHT = CHART_WIDTH >= 400 ? 400 : CHART_WIDTH
  const RADIUS = CHART_HEIGHT >= 400 ? 200 : CHART_HEIGHT / 2
  const { green, yellow, orange, lightBlue, turquoise, lightBrown, ultramarine } = enums.CONDITION_INDEX_COLORS
  const { inProgress, open, scheduled } = enums.ISSUE_COLORS
  const [data, setData] = useState([])
  const [issueData, setIssueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [legendWidth, setLegendWidth] = useState(CHART_WIDTH)

  const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, ...data }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill='white' textAnchor='middle' fontWeight={800} fontSize={13} dominantBaseline='central'>
        {`${data.value}`}
      </text>
    )
  }, [])

  const renderActiveShape = props => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, label, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'
    const labels = label.split(' ')
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor='middle' fill={fill}>
          {payload.name}
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none' />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none' />
        {labels.map((label, index) => (
          <text key={label} x={ex + (cos >= 0 ? 1 : -1) * 12} fontWeight='800' y={ey + index * 14} textAnchor={textAnchor} fill='#333'>
            {label}
          </text>
        ))}
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} fontWeight='800' y={ey} dy={labels.length * 10 + 8} textAnchor={textAnchor} fill='#999'>
          {value}
        </text>
      </g>
    )
  }
  const onClick = d => history.push({ pathname: `/assets`, state: { filterFromPie: true, payload: d.label } })
  const onIssueClick = d => history.push({ pathname: `/issues`, state: { filterFromPie: true, filter: d.label } })

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const res = await getPieChartCount()
        const _data = []
        const _issueData = []
        if (res.data.zero_value_asset_count) _data.push({ label: 'Unknown', value: res.data.zero_value_asset_count, color: theme.palette.primary.main })
        if (res.data.good_condition_asset_count) _data.push({ label: 'Operating Normally', value: res.data.good_condition_asset_count, color: green })
        if (res.data.repair_Needed) _data.push({ label: 'Repair Needed', value: res.data.repair_Needed, color: yellow })
        if (res.data.replacement_Needed) _data.push({ label: 'Replacement Needed', value: res.data.replacement_Needed, color: orange })
        if (res.data.repair_Scheduled) _data.push({ label: 'Repair Scheduled', value: res.data.repair_Scheduled, color: lightBlue })
        if (res.data.replacement_Scheduled) _data.push({ label: 'Replacement Scheduled', value: res.data.replacement_Scheduled, color: turquoise })
        if (res.data.decomissioned) _data.push({ label: 'Decomissioned', value: res.data.decomissioned, color: lightBrown })
        if (res.data.spare) _data.push({ label: 'Spare', value: res.data.spare, color: ultramarine })
        if (res.data.open_issue_count) _issueData.push({ label: 'Open', value: res.data.open_issue_count, color: open })
        if (res.data.inprogress_issue_count) _issueData.push({ label: 'In Progress', value: res.data.inprogress_issue_count, color: inProgress })
        if (res.data.schedule_issue_count) _issueData.push({ label: 'Scheduled', value: res.data.schedule_issue_count, color: scheduled })
        setData(_data)
        setIssueData(_issueData)
        getUserFacilitiesData()
        setLoading(false)
      } catch (error) {
        setData([])
        setIssueData([])
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const updateLegendWidth = () => setLegendWidth(window.innerWidth * 0.315 - 32)
    window.addEventListener('resize', updateLegendWidth)
    return () => window.removeEventListener('resize', updateLegendWidth)
  }, [])

  const handleCountFormater = data => {
    setNotificationsCount(data)
  }

  // notificaton Api Integration
  const { data: countData } = useFetchData({ fetch: notification.count, formatter: d => handleCountFormater(get(d, 'data', 0)) })

  // loginsite data

  // const handleUserSiteRoleformatter = data => {
  //   const clientCompany = get(data, 'clientCompany', []).filter(d => d.clientCompanyId === data.activeClientCompanyId)
  //   const clientCompanyUsersites = clientCompany.length > 0 ? clientCompany[0].clientCompanyUsersites : []

  //   setLoginSiteData(prevState => {
  //     const updatedLoginSiteData = {
  //       ...prevState,
  //       // roleName: get(data, 'activeRoleNameWeb', ''),
  //       // defaultroleName: get(data, 'defaultRoleNameWeb', ''),
  //       siteName: get(data, 'activeSiteName', []),
  //       defaultSiteName: get(data, 'defaultSiteName', []),
  //       clientCompanyName: get(data, 'activeClientCompanyName', ''),
  //       userroles: get(data, 'userroles', []),
  //       client_company: get(data, 'clientCompany', []),
  //       accessibleSites: clientCompanyUsersites,
  //       activeSiteId: get(data, 'activeSiteId', prevState.activeSiteId),
  //     }

  //     // Update session storage
  //     Object.keys(updatedLoginSiteData).forEach(key => {
  //       sessionStorage.setItem(key, JSON.stringify(updatedLoginSiteData[key]))
  //     })
  //     sessionStorage.setItem('siteId', data.activeSiteId)
  //     // sessionStorage.setItem('roleId', data.activeRoleIdWeb)
  //     // sessionStorage.setItem('roleName', data.activeRoleNameWeb)

  //     const activeSiteList = clientCompanyUsersites.map(v => v.siteId)

  //     if (!activeSiteList.includes(updatedLoginSiteData.activeSiteId) && clientCompanyUsersites.length > 0) {
  //       handleSiteRadioClick(clientCompanyUsersites[0], clientCompanyUsersites)
  //     }

  //     if (isEmpty(clientCompany)) {
  //       changeClientCompany(get(data, 'clientCompany', [])[0])
  //     }

  //     return updatedLoginSiteData
  //   })
  // }

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

  // const {} = useFetchData({ fetch: facilities.getUserSitesAndRoles, payload: get(loginData, 'uuid', ''), formatter: d => handleUserSiteRoleformatter(get(d, 'data', {})), defaultValue: {} })

  useFetchData({ fetch: notification.count, formatter: d => handleCountFormater(get(d, 'data', 0)) })

  return (
    <div className='d-flex justify-content-between'>
      <Paper style={{ width: '49%', height: 'initial', marginBottom: '20px', overflowX: 'auto' }} elevation={0} id='style-1'>
        <div className='d-flex justify-content-between text-bold p-3 text-md'>State of Assets</div>
        <div style={{ padding: '16px', height: 'calc(100% - 55px)' }}>
          {loading ? (
            <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: '100%' }}>
              <CircularProgress size={50} thickness={5} />
            </div>
          ) : _.isEmpty(data) ? (
            <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: '100%', opacity: 0.75 }}>
              No Asset found !
            </div>
          ) : (
            <>
              <PieChart width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Pie activeShape={renderActiveShape} isAnimationActive={false} data={data} cx={CHART_WIDTH / 2} cy={CHART_HEIGHT / 2} paddingAngle={0.5} innerRadius={RADIUS * 0.4} outerRadius={RADIUS * 0.8} fill='#8884d8' dataKey='value' label={entry => renderCustomizedLabel(entry)} style={{ cursor: 'default' }}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{ display: 'grid', gridTemplateColumns: legendWidth > 369 ? '1fr 1fr' : '1fr' }}>
                {data.map((val, index) => (
                  <div className='d-flex p-2 hover' key={index} style={{ borderRadius: '3px', cursor: 'pointer' }} onClick={() => onClick(val)}>
                    <div style={{ minWidth: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '8px', background: val.color }}></div>
                    <div style={{ fontSize: '12px', fontWeight: 800, marginLeft: '12px' }}>{val.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Paper>
      <Paper style={{ width: '49%', height: 'initial', marginBottom: '20px', overflowX: 'auto' }} elevation={0} id='style-1'>
        <div className='d-flex justify-content-between text-bold p-3 text-md'>State of Issues</div>
        <div style={{ padding: '16px', height: 'calc(100% - 55px)' }}>
          {loading ? (
            <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: '100%' }}>
              <CircularProgress size={50} thickness={5} />
            </div>
          ) : _.isEmpty(issueData) ? (
            <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: '100%', opacity: 0.75 }}>
              No Issues found !
            </div>
          ) : (
            <>
              <PieChart width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Pie activeShape={renderActiveShape} isAnimationActive={false} data={issueData} cx={CHART_WIDTH / 2} cy={CHART_HEIGHT / 2} paddingAngle={0.5} innerRadius={RADIUS * 0.4} outerRadius={RADIUS * 0.8} fill='#8884d8' dataKey='value' label={entry => renderCustomizedLabel(entry)} style={{ cursor: 'default' }}>
                  {issueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{ display: 'grid', gridTemplateColumns: legendWidth > 369 ? '1fr 1fr' : '1fr' }}>
                {issueData.map((val, index) => (
                  <div className='d-flex p-2 hover' key={index} style={{ borderRadius: '3px', cursor: 'pointer' }} onClick={() => onIssueClick(val)}>
                    <div style={{ minWidth: '16px', maxWidth: '16px', maxHeight: '16px', borderRadius: '8px', background: val.color }}></div>
                    <div style={{ fontSize: '12px', fontWeight: 800, marginLeft: '12px' }}>{val.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Paper>
    </div>
  )
}
