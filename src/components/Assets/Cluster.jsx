import React, { useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import useFetchData from 'hooks/fetch-data'

import { isEmpty, get, has } from 'lodash'

import getCluster from 'Services/Asset/get-cluster'
import './assets.css'

import { useTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import TreeView from 'components/Assets/tree'
import makeTree from 'components/Assets/tree/make-tree'
import getUserRole from 'helpers/getUserRole'
import SearchComponent from 'components/common/search'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { ActionButton } from 'components/common/buttons'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

const Cluster = () => {
  const { loading, data, reFetch } = useFetchData({ fetch: getCluster, payload: { wo_id: null }, formatter: d => formatCluster(d) })
  const [backlinks, setBacklinks] = useState([])
  const [searchString, setSearchString] = useState('')
  const [triggerSearch, setTriggerSearch] = useState(0)
  const formatCluster = d => {
    try {
      const loginData = JSON.parse(localStorage.getItem('loginData'))
      const clientCompany = getApplicationStorageItem('clientCompanyName')
      const site = getApplicationStorageItem('siteName')
      const root = { name: clientCompany, type: 'company', children: [] }
      const company = loginData.client_company.find(d => d.client_company_name === clientCompany)
      const sites = company.client_company_Usersites.filter(d => d.site_name === site)
      const data = get(d, 'data', [])
      const { nodes, backLinks } = makeTree(data)
      setBacklinks(backLinks)
      sites.forEach(site => {
        root.children.push({
          name: site.site_name,
          type: 'site',
          children: nodes,
        })
      })
      return root
    } catch (error) {
      return {}
    }
  }
  const theme = useTheme()
  const containerRef = useRef(null)
  const primaryColor = theme.palette.primary.main
  const userRole = new getUserRole()
  const [filteredNodesCount, setFilteredNodesCount] = useState(0)
  const [nextPreviousCount, setNextPreviousCount] = useState(null)

  const handleNodeClick = nodeDatum => {
    if (['company', 'site'].includes(nodeDatum.type)) return
    // if (userRole.isExecutive()) return
    window.open(`assets/details/${nodeDatum.asset_id}`, '_blank')
  }

  const onTriggerSearch = () => {
    setTriggerSearch(p => p + 1)
  }

  const onSearchNodes = filteredNodesCount => {
    setNextPreviousCount(null)
    setFilteredNodesCount(filteredNodesCount)
  }

  return (
    <div style={{ height: '83vh', padding: '20px', background: '#fff' }}>
      <div className='d-flex flex-row justify-content-sm-end align-items-center mt-2'>
        <SearchComponent searchString={searchString} setSearchString={setSearchString} postSearch={onTriggerSearch} postClear={() => setFilteredNodesCount(0)} />
        {filteredNodesCount > 0 && (
          <>
            <ActionButton
              tooltipPlacement='top'
              icon={<ChevronLeftIcon size='small' />}
              tooltip='Previous'
              action={() => {
                if (nextPreviousCount - 1 > -1) {
                  setNextPreviousCount(c => c - 1)
                }
              }}
              disabled={nextPreviousCount - 1 <= -1}
            />
            <ActionButton
              tooltipPlacement='top'
              icon={<ChevronRightIcon size='small' />}
              tooltip='Next'
              action={() => {
                if (nextPreviousCount + 1 < filteredNodesCount) {
                  setNextPreviousCount(c => c + 1)
                }
              }}
              disabled={nextPreviousCount + 1 >= filteredNodesCount}
            />
          </>
        )}
      </div>
      <div style={{ height: '100%' }} className='d-flex justify-content-center align-items-center' ref={containerRef}>
        {loading ? (
          <CircularProgress size={32} thickness={5} />
        ) : isEmpty(data) ? (
          <strong>No data found</strong>
        ) : (
          <TreeView backLinks={backlinks} data={data} refetch={reFetch} primaryColor={primaryColor} handleNodeClick={handleNodeClick} searchString={searchString} triggerSearch={triggerSearch} onSearchNodes={onSearchNodes} triggerNextPreviousCount={nextPreviousCount} />
        )}
      </div>
    </div>
  )
}

export default Cluster
