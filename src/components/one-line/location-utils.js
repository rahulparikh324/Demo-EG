import { panSpeed, direction } from 'components/Assets/tree/constants'
import _ from 'lodash'
import enums from 'Constants/enums'
import { criticalityOptions, physicalConditionOptions } from 'components/WorkOrders/onboarding/utils'
import { AssetTypeIcon } from 'components/common/others'
import { renderToString } from 'react-dom/server'
import * as d3 from 'd3'
import AccountBalanceOutlinedIcon from '@material-ui/icons/AccountBalanceOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'
import LayersOutlinedIcon from '@material-ui/icons/LayersOutlined'
import MeetingRoomOutlinedIcon from '@material-ui/icons/MeetingRoomOutlined'

export const createNode = ({ g, nodes, overCircle, outCircle, primaryColor, handleNodeClick }) => {
  const radius = 12
  const ghostRadius = 40
  const { green, yellow, orange, lightBlue, turquoise, lightBrown, ultramarine } = enums.CONDITION_INDEX_COLORS
  const getFill = index => {
    if (index === enums.PHYSICAL_CONDITION.OPERATING_NORMALLY) return green
    if (index === enums.PHYSICAL_CONDITION.REPAIR_NEDDED) return yellow
    if (index === enums.PHYSICAL_CONDITION.REPLACEMENT_NEEDED) return orange
    if (index === enums.PHYSICAL_CONDITION.REPAIR_SCHEDULED) return lightBlue
    if (index === enums.PHYSICAL_CONDITION.REPLACEMENT_SCHEDULED) return turquoise
    if (index === enums.PHYSICAL_CONDITION.DECOMMISIONED) return lightBrown
    if (index === enums.PHYSICAL_CONDITION.SPARE) return ultramarine
    return primaryColor
  }

  const renderIconHtml = (asset_type, type) => {
    if (!_.isEmpty(asset_type)) {
      return renderToString(<AssetTypeIcon type={asset_type} />)
    } else if (type === 'company') {
      return renderToString(<AccountBalanceOutlinedIcon />)
    } else if (type === 'site') {
      return renderToString(<BusinessOutlinedIcon className='mr-2' />)
    } else if (type === 'building') {
      return renderToString(<BusinessOutlinedIcon className='mr-2' />)
    } else if (type === 'floor') {
      return renderToString(<LayersOutlinedIcon className='mr-2' />)
    } else if (type === 'room') {
      return renderToString(<MeetingRoomOutlinedIcon className='mr-2' />)
    }
    return renderToString('')
  }

  const showAssetDetail = detail => {
    return `<ul>
    <li><strong>Name: </strong>${detail.name} </li>
    <li><strong>Internal ID: </strong>${!_.isEmpty(detail.internal_asset_id) ? detail.internal_asset_id : 'N/A'}</li>
    <li><strong>Criticality: </strong>${!_.isNaN(detail.criticality_index_type) && !_.isEmpty(criticalityOptions.find(e => e.value === detail.criticality_index_type)) ? criticalityOptions.find(e => e.value === detail.criticality_index_type).label : 'N/A'}</li>
    <li><strong>Building: </strong>${!_.isEmpty(detail.building) ? detail.building : 'N/A'}</li>
    <li><strong>Floor: </strong>${!_.isEmpty(detail.floor) ? detail.floor : 'N/A'}</li>
    <li><strong>Room: </strong>${!_.isEmpty(detail.room) ? detail.room : 'N/A'}</li>
    <li><strong>Section: </strong>${!_.isEmpty(detail.section) ? detail.section : 'N/A'}</li>
    <li><strong>Asset Class name: </strong>${!_.isEmpty(detail.asset_class_name) ? detail.asset_class_name : 'N/A'}</li>
    <li><strong>Operating Conditions: </strong>${!_.isNaN(detail.asset_operating_condition_state) && !_.isEmpty(physicalConditionOptions.find(e => e.value === detail.asset_operating_condition_state)) ? physicalConditionOptions.find(e => e.value === detail.asset_operating_condition_state).label : 'N/A'}</li>
  </ul>`
  }

  const isTooltipEmpty = d3.select('#location-tooltip').empty()
  if (!isTooltipEmpty) {
    d3.select('#location-tooltip').remove()
  }
  const tooltip = d3.select('#location-tree-graph').append('div').attr('id', 'location-tooltip').attr('class', 'hover-content').attr('style', 'opacity: 0;').attr('width', 200).attr('height', 200)

  const node = g
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .attr('id', d => d.data.asset_id)
  node
    .append('circle')
    .attr('class', 'node-circle')
    .attr('r', radius)
    .attr('fill', d => getFill(d.data.asset_operating_condition_state))
    .style('cursor', d => (['company', 'site', 'building', 'floor', 'room'].includes(d.data.type) ? 'default' : 'pointer'))
    .on('mouseover', function (event) {
      if (!_.isEmpty(event.data) && !['company', 'site', 'building', 'floor', 'room'].includes(event.data.type)) {
        //Highlight the hovered node
        tooltip
          .style('opacity', 1)
          .html(showAssetDetail(event.data))
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px')
      }
    })
    .on('mouseout', function () {
      tooltip.html('')
      tooltip.style('opacity', 0)
    })
  node
    .append('circle')
    .attr('class', 'ghost-circle')
    .attr('r', ghostRadius)
    .on('mouseover', node => overCircle(g, node))
    .on('mouseout', node => outCircle(g, node))
  node
    .filter(d => !['company', 'site', 'building', 'floor', 'room'].includes(d.data.type))
    .append('foreignObject')
    .attr('class', 'asset-type-icon')
    .attr('x', -20)
    .attr('y', -40)
    .attr('width', 22)
    .attr('height', 22)
    .html(d => renderIconHtml(d.data.asset_class_type))
  node
    .filter(d => ['company', 'site', 'building', 'floor', 'room'].includes(d.data.type))
    .append('foreignObject')
    .attr('class', 'asset-type-icon')
    .attr('x', -20)
    .attr('y', -40)
    .attr('width', 22)
    .attr('height', 22)
    .html(d => renderIconHtml(null, _.get(d, 'data.type', null)))
  node
    .append('text')
    .attr('x', d => (['company', 'site', 'building', 'floor', 'room'].includes(d.data.type) ? 5 : !_.isEmpty(d.data.asset_class_type) ? 5 : -20))
    .attr('y', d => (['company', 'site', 'building', 'floor', 'room'].includes(d.data.type) ? -25 : !_.isEmpty(d.data.asset_class_type) ? -25 : -40))
    .attr('font-size', '10px')
    .attr('fill', 'black')
    .attr('font-weight', 800)
    .text(d => `${d.data.name ? d.data.name.slice(0, 22) : ''}${d.data.name && d.data.name.length > 22 ? '...' : ''}`)
  return node
}

const diagonal = (source, target) => {
  //console.log(source, target)
  return `M ${source.y} ${source.x} C ${(source.y + target.y) / 2} ${source.x}, ${(source.y + target.y) / 2} ${target.x}, ${target.y} ${target.x}`
}

export const createLink = ({ g, links }) => {
  return g
    .selectAll('path.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d => diagonal(d.source, d.target))
}
