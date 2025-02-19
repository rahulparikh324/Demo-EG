import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import _, { get } from 'lodash'
import useFetchData from 'hooks/fetch-data'

import { useTheme } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'

import getCluster from 'Services/Asset/get-cluster'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

import { createNode, createLink } from 'components/one-line/location-utils'
import { ActionButton } from 'components/common/buttons'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchComponent from 'components/common/search'
import { Toast } from 'Snackbar/useToast'

const makeTree = nodes => {
  const groupAssets = nodes => {
    // Filter out nodes with null formiobuilding_id, formiofloor_id, or formioroom_id
    const validNodes = nodes.filter(node => node.formiobuilding_id !== null && node.formiofloor_id !== null && node.formioroom_id !== null)
    const buildings = _.groupBy(validNodes, 'building')
    const locationWiseData = _.map(buildings, (buildingNodes, buildingName) => {
      const floors = _.groupBy(buildingNodes, 'floor')
      const floorNodes = _.map(floors, (floorNodes, floorName) => {
        const rooms = _.groupBy(floorNodes, 'room')
        const roomNodes = _.map(rooms, (roomNodes, roomName) => {
          return {
            name: roomName,
            type: 'room',
            children: roomNodes.map(node => ({
              ...node,
              children: node.children
                ? node.children.map(child => ({
                    ...child,
                    children: child.children ? child.children : null,
                  }))
                : null,
            })),
          }
        })
        return {
          name: floorName,
          type: 'floor',
          children: roomNodes,
        }
      })
      return {
        name: buildingName,
        type: 'building',
        children: floorNodes,
      }
    })
    console.log(
      'null location data -',
      nodes.filter(node => node.formiobuilding_id === null && node.formiofloor_id === null && node.formioroom_id === null)
    )
    return locationWiseData
  }

  const treeData = groupAssets(nodes)

  return { nodes: treeData }
}

const LocationWise = () => {
  const theme = useTheme()
  const containerRef = useRef(null)
  let droppingNode
  const primaryColor = theme.palette.primary.main
  const [searchString, setSearchString] = useState('')
  const [triggerSearch, setTriggerSearch] = useState(0)
  const [filteredNodesCount, setFilteredNodesCount] = useState(0)
  const [nextPreviousCount, setNextPreviousCount] = useState(null)
  const { loading, data, reFetch } = useFetchData({ fetch: getCluster, payload: { wo_id: null }, formatter: d => formatCluster(d) })
  const formatCluster = d => {
    try {
      const loginData = JSON.parse(localStorage.getItem('loginData'))
      const clientCompany = getApplicationStorageItem('clientCompanyName')
      const site = getApplicationStorageItem('siteName')
      const root = { name: clientCompany, type: 'company', children: [] }
      const company = loginData.client_company.find(d => d.client_company_name === clientCompany)
      const sites = company.client_company_Usersites.filter(d => d.site_name === site)
      const data = _.get(d, 'data', [])
      const { nodes } = makeTree(data)
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

  useEffect(() => {
    try {
      if (containerRef.current && !_.isEmpty(data)) {
        //size variables
        const height = containerRef.current.clientHeight - 10
        const width = containerRef.current.clientWidth - 10
        //zoom
        const zoomed = () => {
          const { k, x, y } = d3.event.transform
          g.attr('transform', `translate(${x},${y}) scale(${k})`)
        }
        //over and out circle
        const overCircle = (g, node) => {
          droppingNode = node
          g.selectAll('.ghost-circle').attr('fill', d => (d.data.asset_id === node.data.asset_id ? 'red' : 'black'))
        }
        const outCircle = (g, node) => {
          droppingNode = null
          g.selectAll('.ghost-circle').attr('fill', 'black')
        }
        //svg elements
        const isSvgPresent = d3.select('#locationGraphSvg').empty()
        const isGEmpty = d3.select('#locationGraphMap').empty()
        const svg = isSvgPresent ? d3.select(containerRef.current).append('svg').attr('id', 'locationGraphSvg').call(d3.zoom().on('zoom', zoomed)) : d3.select('#locationGraphSvg').call(d3.zoom().on('zoom', zoomed))
        svg.attr('width', width).attr('height', height)

        let g
        if (!isGEmpty) d3.select('#locationGraphMap').remove()
        g = svg.append('g').attr('id', 'locationGraphMap').attr('transform', `translate(${50},${50})`)
        //tree
        const treeMap = d3
          .tree()
          .size([width - 100, height - 600])
          .nodeSize([150, 150])
        //make tree
        const update = data => {
          const hierarcy = d3.hierarchy(data)
          const nodes = treeMap(hierarcy)
          const links = [...nodes.links()]
          nodes.descendants().forEach(d => (d.y = d.depth * 140))
          g.transition().attr('transform', `translate(${150},${height / 2})`)
          //elements
          createLink({ g, links })
          const node = createNode({ g, nodes: nodes.descendants(), overCircle, outCircle, primaryColor })
          node.on('click', (e, node) => {
            if (['company', 'site', 'building', 'floor', 'room'].includes(e.data.type)) return
            if (e.defaultPrevented) return
            else if (get(e, 'data.asset_id', null) !== null) {
              window.open(`assets/details/${e.data.asset_id}`, '_blank')
            }
          })
          //node.call(drag())
        }
        update(data)
      }
    } catch (error) {
      console.log(error)
    }
    return () => {}
  }, [data])

  const onTriggerSearch = () => {
    setTriggerSearch(p => p + 1)
  }

  const onSearchNodes = filteredNodesCount => {
    setNextPreviousCount(null)
    setFilteredNodesCount(filteredNodesCount)
  }

  useEffect(() => {
    handleSearch()
  }, [searchString, triggerSearch])

  useEffect(() => {
    if (nextPreviousCount > -1) {
      handleSearch(nextPreviousCount)
    }
  }, [nextPreviousCount])
  const handleSearch = (triggerNextPreviousCount = null) => {
    try {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight - 10
        const width = containerRef.current.clientWidth - 10

        const svg = d3.select('#locationGraphSvg')
        const g = d3.select('#locationGraphMap')

        const zoom = d3
          .zoom()
          .scaleExtent([0.1, 10])
          .on('zoom', () => {
            g.attr('transform', d3.event.transform)
          })

        svg.call(zoom)

        const node = svg.selectAll('.node')

        if (!_.isEmpty(searchString)) {
          // Zoom based on search text
          const searchedNode = node.filter(d => !_.isEmpty(d.data.name) && d.data.name.toLowerCase().includes(searchString.toLowerCase()))
          if (!searchedNode.empty() && !_.isNull(triggerNextPreviousCount) && !_.isEmpty(searchedNode.nodes()[triggerNextPreviousCount])) {
            const selectedNode = searchedNode.nodes()[triggerNextPreviousCount].__data__
            const x = selectedNode.y
            const y = selectedNode.x

            // Apply the zoom transformation to center the searched node in the SVG
            const newTransform = d3.zoomIdentity.translate(width * 0.5 - 2 * x, height * 0.5 - 2 * y).scale(2) // Adjust the scale as needed
            svg.transition().duration(750).call(zoom.transform, newTransform)
          } else if (!searchedNode.empty()) {
            onSearchNodes(searchedNode.nodes().length)
            const x = searchedNode.datum().y
            const y = searchedNode.datum().x

            // Apply the zoom transformation to center the searched node in the SVG
            const newTransform = d3.zoomIdentity.translate(width * 0.5 - 2 * x, height * 0.5 - 2 * y).scale(2) // Adjust the scale as needed
            svg.transition().duration(750).call(zoom.transform, newTransform)
          } else {
            Toast.error('No data found using these search criteria!')
          }
        } else {
          //reset zoom
          svg
            .transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(150, height / 2).scale(1))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 128px)', background: '#fff', paddingTop: '20px' }}>
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
      <div style={{ height: '100%' }} className='d-flex justify-content-center align-items-center'>
        <div style={{ height: '100%', width: '100%' }} ref={containerRef} id='location-tree-graph'>
          {loading ? (
            <div className='d-flex justify-content-center align-items-center h-100'>
              <CircularProgress size={32} thickness={5} />
            </div>
          ) : _.isEmpty(data) ? (
            <div className='d-flex justify-content-center align-items-center h-100'>
              <strong>No data found</strong>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationWise
