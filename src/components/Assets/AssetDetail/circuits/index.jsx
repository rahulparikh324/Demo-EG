import React, { useEffect, useState, useRef } from 'react'

import useFetchData from 'hooks/fetch-data'
import { get, groupBy, map, isEmpty } from 'lodash'

import { MinimalButton } from 'components/common/buttons'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import { Toast } from 'Snackbar/useToast'

import FedByCircuits from 'components/Assets/AssetDetail/circuits/fed-by-circuits'
import FeedingCircuits from 'components/Assets/AssetDetail/circuits/feeding-circuits'
import ViewCircuit from './view-circuit'

import generateReport from 'components/Assets/AssetDetail/circuits/generate-report'

import asset from 'Services/assets'

const Circuits = ({ assetId, render, assetDetails }) => {
  const { initialLoading, data, reFetch } = useFetchData({ fetch: asset.circuit.get, payload: { assetId }, formatter: d => get(d, 'data', {}) })
  const formatSubCompOptions = list => list.map(d => ({ ...d, label: d.sublevelcomponentAssetName, value: d.sublevelcomponentAssetId }))
  const { loading: optionsLoading, data: viaSubComponentOpts } = useFetchData({ fetch: asset.subComponents.get, payload: { pageindex: 1, pagesize: 20, assetId }, formatter: d => formatSubCompOptions(get(d, 'data.list', [])) })
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)
  const [isViewCircuitOpen, setViewCircuitOpen] = useState(false)
  const [isShowCircuit, setShowCircuit] = useState(false)

  useEffect(() => {
    setShowCircuit(get(assetDetails, 'asset_class_type', '')?.includes('PANELS') ? true : false)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    reFetch()
  }, [render])
  //
  const arrayToTree = (arr, parent = 0) => arr.filter(item => item.fedByAssetId === parent).map(child => ({ ...child, children: arrayToTree(arr, child.feedingAssetId) }))
  const getFeedingCiruits = async () => {
    try {
      const res = await asset.circuit.getFeedingCircuit({ assetId })
      if (res.success > 0) {
        const tree = arrayToTree(get(res, 'data.assetFeedingCircuitList', []), assetId)
        Toast.success('Report Download successfully !')
        return { tree, res }
      } else {
        Toast.error(res.message)
        return { tree: [], res }
      }
    } catch (error) {
      return { tree: [], res: -1 }
    }
  }

  const generateCircuitReport = async () => {
    setLoading(true)
    const { tree, res } = await getFeedingCiruits()
    if (res.success > 0 || res.success === -2) {
      generateReport(assetDetails, data, tree)
    }
    setLoading(false)
  }

  return (
    <>
      <div style={{ height: 'calc(100% - 42px)', padding: '10px', minHeight: '400px' }}>
        <MinimalButton onClick={generateCircuitReport} loadingText='Generating Report' text='Generate Circuit Report' startIcon={<InsertDriveFileOutlinedIcon fontSize='small' />} loading={loading} disabled={loading} variant='contained' color='primary' baseClassName='xs-button mb-2 mr-2' />
        {isShowCircuit && <MinimalButton onClick={() => setViewCircuitOpen(true)} text='View Schedule Circuit' variant='contained' color='primary' baseClassName='xs-button mb-2' />}
        <div className='text-bold mb-2'>Fed-By Circuits</div>
        <FedByCircuits assetId={assetId} initialLoading={initialLoading} data={get(data, 'fedbyAssetList', [])} reFetch={reFetch} optionsLoading={optionsLoading} viaSubComponentOpts={viaSubComponentOpts} />
        <div className='text-bold my-2'>Feeding Circuits</div>
        <FeedingCircuits assetId={assetId} initialLoading={initialLoading} data={get(data, 'feedingAssetList', [])} reFetch={reFetch} optionsLoading={optionsLoading} viaSubComponentOpts={viaSubComponentOpts} />
      </div>
      {isViewCircuitOpen && <ViewCircuit open={isViewCircuitOpen} onClose={() => setViewCircuitOpen(false)} dataList={get(data, 'feedingAssetList', [])} assetDetails={assetDetails} />}
    </>
  )
}

export default Circuits
