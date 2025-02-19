import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import $ from 'jquery'
import 'components/WorkOrders/one-line/tree.css'
import { createNode, createLink, pan } from 'components/WorkOrders/one-line/utils'
import _ from 'lodash'
import { panBoundary, direction } from 'components/Assets/tree/constants'
import changeAssetHierarchy from 'Services/Asset/changeHierarchy'
import { Toast } from 'Snackbar/useToast'
import DialogPrompt from 'components/DialogPrompt'
import enums from 'Constants/enums'

const TreeView = ({ data, refetch, primaryColor, handleNodeClick, backLinks, searchString = null, currentZoom = null, resetCurrentZoom, woStatus = 0, triggerSearch = 0, onSearchNodes, triggerNextPreviousCount = null }) => {
  //
  const containerRef = useRef(null)
  let droppingNode, clickTime, dragendedCalledWithNoDroppingNode
  const [isChangeParentPromptOpen, setChangeParentPromptOpen] = useState(false)
  const [isLoading, setloading] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [payload, setPayload] = useState({})
  const [cancelChange, setCancelChange] = useState(0)
  // const [count, setCount] = useState(0)
  // const [searchedFilteredData, setSearchFilteredData] = useState([])

  const changeParent = async () => {
    setloading(true)
    try {
      const res = await changeAssetHierarchy(payload)
      if (res.success > 0) Toast.success(`Hierarchy Updated !`)
      else Toast.error(res.message)
      setloading(false)
      setPayload({})
      refetch(payload.changing_asset_id)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
  }
  const checkNodeClick = d => {
    if (clickTime > 250) return
    const svg = d3.select('#graphSvg')
    const detail = {
      ...d.data,
      currentZoom: d3.zoomTransform(svg.node()),
    }
    handleNodeClick(detail)
  }
  useEffect(() => {
    try {
      if (containerRef.current) {
        dragendedCalledWithNoDroppingNode = false
        //size variables
        const height = containerRef.current.clientHeight - 10
        const width = containerRef.current.clientWidth - 10
        //zoom
        const zoomed = () => {
          const { k, x, y } = d3.event.transform
          g.attr('transform', `translate(${x},${y}) scale(${k})`)
        }
        //process node being dragged
        const processDragged = (d, node) => {
          const parentID = d.parent.data.asset_id
          g.selectAll('.ghost-circle').attr('class', d => (d.depth > 1 && d.data.asset_id !== parentID ? 'ghost-circle show' : 'ghost-circle'))
          node.select('.ghost-circle').attr('class', 'ghost-circle')
          node.attr('pointer-events', 'none')
          g.selectAll('.node').sort(x => (x.data.asset_id === d.data.asset_id ? 1 : -1))
          //remove child nodes and links
          if (!_.isEmpty(d.children)) {
            g.selectAll('path.link')
              .filter(x => x.source.data.asset_id === d.data.asset_id)
              .remove()
            g.selectAll('.node')
              .filter(x => !_.isEmpty(x.parent) && x.parent.data.asset_id === d.data.asset_id)
              .remove()
          }
          //remove parent link
          g.selectAll('path.link')
            .filter(x => x.target.data.asset_id === d.data.asset_id)
            .remove()
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
        const isSvgPresent = d3.select('#graphSvg').empty()
        const isGEmpty = d3.select('#graphMap').empty()
        const svg = isSvgPresent ? d3.select(containerRef.current).append('svg').attr('id', 'graphSvg').call(d3.zoom().on('zoom', zoomed)) : d3.select('#graphSvg').call(d3.zoom().on('zoom', zoomed))
        svg.attr('width', width).attr('height', height)

        let g
        if (!isGEmpty) d3.select('#graphMap').remove()
        g = svg.append('g').attr('id', 'graphMap').attr('transform', `translate(${50},${50})`)
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
          if (!_.isEmpty(backLinks)) {
            backLinks.forEach(d => {
              const source = nodes.descendants().find(x => x.data.asset_id === d.source)
              const target = nodes.descendants().find(x => x.data.asset_id === d.target)
              if (source && target) links.push({ source, target })
            })
          }
          if (!_.isEmpty(currentZoom)) {
            const { k, x, y } = currentZoom
            g.transition().attr('transform', `translate(${x},${y}) scale(${k})`)
            resetCurrentZoom()
          } else if (dragendedCalledWithNoDroppingNode === false) {
            g.transition().attr('transform', `translate(${width / 2},${30})`)
          }
          //elements
          createLink({ g, links })
          const node = createNode({ g, nodes: nodes.descendants(), overCircle, outCircle, primaryColor, handleNodeClick })
          node.on('click', (e, node) => {
            // console.log(e, node)
            if (e.defaultPrevented) return
            clickTime = 0
            checkNodeClick(e)
          })
          if (woStatus !== enums.woTaskStatus.Complete) {
            node.call(drag())
          }
        }
        //drag
        const drag = () => {
          const dragstarted = d => {
            if (d.depth < 2) return
            const isSourceMain = d.data.is_asset_temp === false && d.data.is_main_asset_assigned === false ? true : false
            if (isSourceMain) return
            if (d.data.temp_asset_woline_status === enums.woTaskStatus.Complete) return
            // console.log('dragstarted')
            d3.event.sourceEvent.stopPropagation()
            clickTime = new Date()
            //d3.event.sourceEvent.preventDefault()
          }

          function dragged(d) {
            if (d.depth < 2) return
            const isSourceMain = d.data.is_asset_temp === false && d.data.is_main_asset_assigned === false ? true : false
            if (isSourceMain) return
            if (d.data.temp_asset_woline_status === enums.woTaskStatus.Complete) return
            const node = d3.select(this)
            processDragged(d, node)
            const [trX, trY] = node
              .attr('transform')
              .match(/\((.*?)\)/g)
              .map(b => b.replace(/\(|(.*?)\)/g, '$1'))[0]
              .split(',')
              .map(d => Number(d))
            node.attr('transform', `translate(${trX + d3.event.dx},${trY + d3.event.dy})`)
            const [relativeX, relativeY] = d3.mouse($('#graphSvg').get(0))
            if (relativeX < panBoundary) pan({ g, dir: direction.left })
            else if (relativeX > $('#graphSvg').width() - panBoundary) pan({ g, dir: direction.right })
            else if (relativeY < panBoundary) pan({ g, dir: direction.up })
            else if (relativeY > $('#graphSvg').height() - panBoundary) pan({ g, dir: direction.down })
          }

          function dragended(d) {
            // console.log('dragend')
            if (d.depth < 2) return
            const isSourceMain = d.data.is_asset_temp === false && d.data.is_main_asset_assigned === false ? true : false
            if (isSourceMain) return
            if (d.data.temp_asset_woline_status === enums.woTaskStatus.Complete) return
            if (!droppingNode) {
              dragendedCalledWithNoDroppingNode = true
              g.selectAll('path.link').remove()
              g.selectAll('.node').remove()
              update(data)
            } else {
              // console.log(droppingNode, d)
              const isSourceTemp = d.data.is_asset_temp || d.data.is_main_asset_assigned ? true : false
              const isDestinationTemp = droppingNode.data.is_asset_temp || droppingNode.data.is_main_asset_assigned ? true : false
              setPayload({ changing_asset_id: d.data.asset_id, destination_asset_id: droppingNode.depth === 1 ? '' : droppingNode.data.asset_id, is_changing_asset_id_temp: isSourceTemp, is_destination_asset_id_temp: isDestinationTemp })
              setPromptText(`Are you sure you want to assign fed-by ${droppingNode.data.name} to ${d.data.name} ?`)
              setChangeParentPromptOpen(true)
            }
            const end = new Date()
            clickTime = end - clickTime
            checkNodeClick(d)
            g.selectAll('.ghost-circle').attr('class', 'ghost-circle')
            d3.select(this).attr('pointer-events', 'all')
          }

          return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
        }
        update(data)
      }
    } catch (error) {
      console.log(error)
    }
    return () => {}
  }, [cancelChange])

  useEffect(() => {
    try {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight - 10
        const width = containerRef.current.clientWidth - 10

        const svg = d3.select('#graphSvg')
        const g = d3.select('#graphMap')

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
          if (!searchedNode.empty()) {
            onSearchNodes(searchedNode.nodes().length)
            console.log(searchedNode.nodes())
            const x = searchedNode.datum().x
            const y = searchedNode.datum().y

            // Apply the zoom transformation to center the searched node in the SVG
            const newTransform = d3.zoomIdentity.translate(width * 0.5 - 2 * x, height * 0.5 - 2 * y).scale(2) // Adjust the scale as needed
            svg.transition().duration(750).call(zoom.transform, newTransform)
          } else {
            Toast.error('No data found using these search criteria!')
          }
        } else {
          if (!_.isEmpty(currentZoom)) {
            const { k, x, y } = currentZoom
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(k))
            resetCurrentZoom()
          } else {
            //reset zoom
            svg
              .transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity.translate(width / 2, 30).scale(1))
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [searchString, triggerSearch])

  useEffect(() => {
    try {
      if (containerRef.current && !_.isNull(triggerNextPreviousCount)) {
        const height = containerRef.current.clientHeight - 10
        const width = containerRef.current.clientWidth - 10

        const svg = d3.select('#graphSvg')
        const g = d3.select('#graphMap')

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
          if (!searchedNode.empty() && !_.isEmpty(searchedNode.nodes()[triggerNextPreviousCount])) {
            const selectedNode = searchedNode.nodes()[triggerNextPreviousCount].__data__
            const x = selectedNode.x
            const y = selectedNode.y

            // Apply the zoom transformation to center the searched node in the SVG
            const newTransform = d3.zoomIdentity.translate(width * 0.5 - 2 * x, height * 0.5 - 2 * y).scale(2) // Adjust the scale as needed
            svg.transition().duration(750).call(zoom.transform, newTransform)
          } else {
            Toast.error('No data found using these search criteria!')
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [triggerNextPreviousCount])

  return (
    <>
      <div style={{ height: '100%', width: '100%' }} ref={containerRef} id='one-line-tree-graph'>
        <DialogPrompt
          title='Assign Fed-By'
          text={promptText}
          open={isChangeParentPromptOpen}
          ctaText='Assign'
          actionLoader={isLoading}
          action={changeParent}
          handleClose={() => {
            setChangeParentPromptOpen(false)
            setCancelChange(p => p + 1)
          }}
        />
      </div>
    </>
  )
}

export default TreeView
