import React, { useEffect, useRef, useState } from 'react'
import useFetchData from 'hooks/fetch-data'

import { isEmpty, get, isBoolean, has } from 'lodash'

import getCluster from 'Services/Asset/get-cluster'
import 'components/Assets/assets.css'

import { useTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import TreeView from 'components/WorkOrders/one-line'
import makeTree from 'components/WorkOrders/one-line/make-tree'
import SearchComponent from 'components/common/search'
import enums from 'Constants/enums'
import DialogPrompt from 'components/DialogPrompt'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { ActionButton } from 'components/common/buttons'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

const Cluster = ({ woId, woType, handleAssetNodeClick, reload, woStatus = 0 }) => {
  const { loading, data, reFetch } = useFetchData({ fetch: getCluster, payload: { wo_id: woId }, formatter: d => formatCluster(d) })
  const [backlinks, setBacklinks] = useState([])
  const [searchString, setSearchString] = useState('')
  const [assetId, setAssetId] = useState('')
  const [currentZoom, setCurrentZoom] = useState(null)
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
      if (isShowAssignModal) setAssignPromptOpen(true)
      return root
    } catch (error) {
      return {}
    }
  }
  const theme = useTheme()
  const containerRef = useRef(null)
  const primaryColor = theme.palette.primary.main
  const [isShowAssignModal, setShowAssignModal] = useState(false)
  const [isAssignPromptOpen, setAssignPromptOpen] = useState(false)
  const [filteredNodesCount, setFilteredNodesCount] = useState(0)
  const [nextPreviousCount, setNextPreviousCount] = useState(null)

  const handleNodeClick = nodeDatum => {
    if (['company', 'site'].includes(nodeDatum.type)) return
    if (isBoolean(nodeDatum.is_asset_temp) && nodeDatum.is_asset_temp === false && nodeDatum.is_main_asset_assigned === false) {
      window.open(`${window.location.origin}/assets/details/${nodeDatum.asset_id}`, '_blank')
    } else if (nodeDatum.temp_asset_woline_status !== enums.woTaskStatus.Complete && woStatus !== enums.woTaskStatus.Complete) {
      if (woType === enums.woType.InfraredScan || woType === enums.woType.OnBoarding) {
        //window.open(`?woonboardingassets_id=${nodeDatum.asset_id}`, '_blank')
        setCurrentZoom(nodeDatum.currentZoom)
        handleAssetNodeClick('EDIT', nodeDatum.asset_id)
      }
    } else {
      if (woType === enums.woType.InfraredScan || woType === enums.woType.OnBoarding) {
        handleAssetNodeClick('VIEW', nodeDatum.asset_id)
      }
    }
  }

  const refetchOneLineData = asset_id => {
    setAssetId(asset_id)
    setShowAssignModal(true)
  }

  useEffect(() => {
    if (isShowAssignModal) {
      reFetch()
    }
  }, [isShowAssignModal])

  useEffect(() => {
    if (reload > 0) {
      reFetch()
    }
  }, [reload])

  const assignOCPData = () => {
    setShowAssignModal(false)
    setAssignPromptOpen(false)
    if (woType === enums.woType.InfraredScan || woType === enums.woType.OnBoarding) {
      handleAssetNodeClick('EDIT', assetId)
    } else {
      window.open(window.location.href, '_blank')
    }
  }

  const resetZoom = () => {
    setCurrentZoom(null)
  }

  const onTriggerSearch = () => {
    setTriggerSearch(p => p + 1)
  }

  const onSearchNodes = filteredNodesCount => {
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
          <TreeView
            backLinks={backlinks}
            data={data}
            refetch={refetchOneLineData}
            primaryColor={primaryColor}
            handleNodeClick={handleNodeClick}
            searchString={searchString}
            currentZoom={currentZoom}
            resetCurrentZoom={resetZoom}
            woStatus={woStatus}
            triggerSearch={triggerSearch}
            onSearchNodes={onSearchNodes}
            triggerNextPreviousCount={nextPreviousCount}
          />
        )}
      </div>
      <DialogPrompt
        title='Assign OCP & OCP Main'
        text='Are you sure you want to assign OCP & OCP Main ?'
        open={isAssignPromptOpen}
        ctaText='Assign'
        actionLoader={false}
        action={assignOCPData}
        handleClose={() => {
          setShowAssignModal(false)
          setAssignPromptOpen(false)
        }}
      />
    </div>
  )
}

export default Cluster
