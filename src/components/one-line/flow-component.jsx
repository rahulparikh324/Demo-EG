import EditAssetForm from 'components/Assets/AssetDetail/edit-asset'
import DialogPrompt from 'components/DialogPrompt'
import enums from 'Constants/enums'
import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import updateAssetStatus from 'Services/Asset/updateAssetStatusService'
import reactFLow from 'Services/react-flow'
import { Toast } from 'Snackbar/useToast'
import $ from 'jquery'

const FlowComponent = () => {
  const [recivedObj, setRecivedObj] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [nodeData, setNodeData] = useState({ list: [], initialEdges: [] })
  const [flowKey, setFlowKey] = useState(0) // Add a state to manage the key for re-rendering

  const { reFetch } = useFetchData({ fetch: reactFLow.get, formatter: d => setNodeData(!isEmpty(get(d, 'data', null)) ? get(d, 'data', null) : { list: [], initialEdges: [] }), externalLoader: true })

  const handleDataChange = async updatedData => {
    $('#pageLoading').show()
    setNodeData({ list: [], initialEdges: [] })
    const recivedData = [...updatedData.changedNodes]
    const newData = recivedData.map(d => ({
      assetId: get(d, 'id', null),
      xAxis: Math.round(get(d, 'position.x', 0)),
      yAxis: Math.round(get(d, 'position.y', 0)),
    }))

    const recivedEdges = [...updatedData.updatedEdgesMovement]
    const newEdges = recivedEdges.map(d => {
      const wrongId = d.id.split('_')[0]
      return {
        id: wrongId === 'xy-edge' ? null : d.isDeleted === true ? get(d, 'id', null) : get(d, 'id', null),
        source: get(d, 'source', '00000000-0000-0000-0000-000000000000'),
        target: get(d, 'target', '00000000-0000-0000-0000-000000000000'),
        isDeleted: get(d, 'isDeleted', false),
        label: get(d, 'label', ''),
        style: get(d, 'style.stroke', ''),
        fedbyDetailsJson: JSON.stringify(d),
      }
    })
    const res = await reactFLow.updatePosition({ assets: [...newData], edges: [...newEdges] })
    if (res.success > 0) {
      Toast.success('Assets Positions and Edges Updated Successfully!')
      reFetch()
      setFlowKey(prevKey => prevKey + 1) // Update the key to re-render the component
    } else if (res.success == -2) {
      Toast.info('You have not made any position changes')
      reFetch()
    } else {
      Toast.error('Something Went Wrong')
      console.log(res.message)
    }
    $('#pageLoading').hide()
  }

  useEffect(() => {
    const onDataChangeHandler = event => {
      const { detail: updatedData } = event
      handleDataChange(updatedData)
    }
    const onSingleChangeHandler = event => {
      const { detail: updatedData } = event
      setRecivedObj(updatedData)
    }
    document.addEventListener('datachange', onDataChangeHandler)
    document.addEventListener('singlechange', onSingleChangeHandler)
    return () => {
      document.removeEventListener('datachange', onDataChangeHandler)
      document.removeEventListener('singlechange', onSingleChangeHandler)
    }
  }, [])

  const handleRefetch = () => {
    setNodeData({ list: [], initialEdges: [] })
    reFetch()
    setFlowKey(prevKey => prevKey + 1)
  }

  const handleDeleteNodeAsset = async () => {
    setDeleteLoading(true)
    try {
      const res = await updateAssetStatus({ asset_id: get(recivedObj, 'changeData', null), status: enums.assetStatus[3].id })
      if (res.data.success === 1) Toast.success(`Asset deleted successfully !`)
      else Toast.error(res.message ?? 'Something went wrong!')
      setDeleteLoading(false)
      setNodeData({ list: [], initialEdges: [] })
      setRecivedObj({ isDeleting: false })
      reFetch()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong!')
      setDeleteLoading(false)
    }
  }

  const formConfigs = [
    {
      condition: get(recivedObj, 'isAdding', false),
      props: {
        open: get(recivedObj, 'isAdding', false),
        editType: 'ASSET',
        onClose: () => setRecivedObj({ isAdding: false }),
        isNew: true,
        status: 3,
        refetch: handleRefetch,
        nodePosition: get(recivedObj, 'changeData', null),
      },
    },
    {
      condition: get(recivedObj, 'isEditing', false),
      props: {
        open: get(recivedObj, 'isEditing', false),
        editType: 'ASSET',
        onClose: () => setRecivedObj({ isEditing: false }),
        status: 3,
        refetch: handleRefetch,
        nodePosition: get(recivedObj, 'changeData.position', null),
        mainListEdit: true,
        assetId: get(recivedObj, 'changeData.id'),
        name: get(recivedObj, 'changeData.data.label', ''),
      },
    },
    {
      condition: get(recivedObj, 'isAddingDownstream', false),
      props: {
        open: get(recivedObj, 'isAddingDownstream', false),
        editType: 'ASSET',
        onClose: () => setRecivedObj({ isAddingDownstream: false }),
        isNew: true,
        status: 3,
        refetch: handleRefetch,
        nodePosition: get(recivedObj, 'changeData.position', null),
        downStreamData: get(recivedObj, 'changeData', null),
      },
    },
    {
      condition: get(recivedObj, 'isAddingLineSide', false),
      props: {
        open: get(recivedObj, 'isAddingLineSide', false),
        editType: 'ASSET',
        onClose: () => setRecivedObj({ isAddingLineSide: false }),
        status: 3,
        refetch: handleRefetch,
        nodePosition: get(recivedObj, 'changeData.position', null),
        mainListEdit: true,
        isNew: true,
        downStreamData: get(recivedObj, 'changeData', null),
        isLoadLineSide: true,
      },
    },
  ]
  return (
    <>
      <react-flow key={flowKey} initialdata={JSON.stringify(nodeData)} />
      {formConfigs.map(({ condition, props }, index) => condition && <EditAssetForm key={index} {...props} />)}
      {get(recivedObj, 'isDeleting', false) && <DialogPrompt title='Delete Asset' text='Are you sure you want to delete this Asset ?' open={get(recivedObj, 'isDeleting', false)} ctaText='Delete' actionLoader={deleteLoading} action={handleDeleteNodeAsset} handleClose={() => setRecivedObj({ isDeleting: false })} />}
    </>
  )
}

export default FlowComponent
