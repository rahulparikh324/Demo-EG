import { panSpeed, direction } from 'components/Assets/tree/constants'
import _ from 'lodash'
import enums from 'Constants/enums'
import { criticalityOptions, physicalConditionOptions } from '../onboarding/utils'
import { AssetTypeIcon } from 'components/common/others'
import { renderToString } from 'react-dom/server'
import * as d3 from 'd3'
import AccountBalanceOutlinedIcon from '@material-ui/icons/AccountBalanceOutlined'
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined'

export const createNode = ({ g, nodes, overCircle, outCircle, primaryColor, handleNodeClick }) => {
  const radius = 12
  const ghostRadius = 40
  const { green, yellow, orange, lightBlue, turquoise, lightBrown, ultramarine } = enums.CONDITION_INDEX_COLORS
  const getFill = (index, type, is_asset_temp = false, is_main_asset_assigned = false) => {
    let nodeColor = primaryColor
    if (index === enums.PHYSICAL_CONDITION.OPERATING_NORMALLY) nodeColor = green
    if (index === enums.PHYSICAL_CONDITION.REPAIR_NEDDED) nodeColor = yellow
    if (index === enums.PHYSICAL_CONDITION.REPLACEMENT_NEEDED) nodeColor = orange
    if (index === enums.PHYSICAL_CONDITION.REPAIR_SCHEDULED) nodeColor = lightBlue
    if (index === enums.PHYSICAL_CONDITION.REPLACEMENT_SCHEDULED) nodeColor = turquoise
    if (index === enums.PHYSICAL_CONDITION.DECOMMISIONED) nodeColor = lightBrown
    if (index === enums.PHYSICAL_CONDITION.SPARE) nodeColor = ultramarine
    if (!['company', 'site'].includes(type) && is_asset_temp === false && is_main_asset_assigned === false) {
      // Append the alpha value for 50% opacity
      nodeColor = nodeColor + '4D'
    }
    return nodeColor
  }

  const getNodeStroke = (type, is_asset_temp = false, is_main_asset_assigned = false) => {
    const strokeOpacity = 1
    if (!['company', 'site'].includes(type) && is_asset_temp === false && is_main_asset_assigned === false) {
      return 0.3
    }
    return strokeOpacity
  }

  const renderIconHtml = (asset_type, type) => {
    if (!_.isEmpty(asset_type)) {
      return renderToString(<AssetTypeIcon type={asset_type} />)
    } else if (type === 'company') {
      return renderToString(<AccountBalanceOutlinedIcon />)
    } else if (type === 'site') {
      return renderToString(<BusinessOutlinedIcon className='mr-2' />)
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

  const getTextFill = (type, is_asset_temp = false, is_main_asset_assigned = false) => {
    let nodeColor = '#000000'
    if (!['company', 'site'].includes(type) && is_asset_temp === false && is_main_asset_assigned === false) {
      // Append the alpha value for 50% opacity
      nodeColor = nodeColor + '4D'
    }
    return nodeColor
  }

  const getTextFontWeight = (type, is_asset_temp = false, is_main_asset_assigned = false) => {
    let nodeFontWeight = 800
    if (!['company', 'site'].includes(type) && is_asset_temp === false && is_main_asset_assigned === false) {
      nodeFontWeight = 500
    }
    return nodeFontWeight
  }

  const isTooltipEmpty = d3.select('#tooltip').empty()
  if (!isTooltipEmpty) {
    d3.select('#tooltip').remove()
  }
  const tooltip = d3.select('#one-line-tree-graph').append('div').attr('id', 'tooltip').attr('class', 'hover-content').attr('style', 'opacity: 0;').attr('width', 200).attr('height', 200)

  const node = g
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .attr('id', d => d.data.asset_id)
  node
    //.filter(d => d.data.is_subcomponent === undefined || !d.data.is_subcomponent)
    .append('circle')
    .attr('class', 'node-circle')
    .attr('r', radius)
    .attr('fill', d => getFill(_.get(d, 'data.asset_operating_condition_state', 0), _.get(d, 'data.type', null), _.get(d, 'data.is_asset_temp', false), _.get(d, 'data.is_main_asset_assigned', false)))
    .style('stroke-opacity', d => getNodeStroke(_.get(d, 'data.type', null), _.get(d, 'data.is_asset_temp', false), _.get(d, 'data.is_main_asset_assigned', false)))
    .style('cursor', d => (['company', 'site'].includes(d.data.type) ? 'default' : 'pointer'))
    .on('mouseover', function (event) {
      if (!_.isEmpty(event.data) && !['company', 'site'].includes(event.data.type)) {
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
  // node
  //   .filter(d => d.data.is_subcomponent)
  //   .append('rect')
  //   .attr('class', 'node-rect')
  //   .attr('x', -nodeWidth / 2)
  //   .attr('y', -10)
  //   .attr('width', 20)
  //   .attr('height', 20)
  //   .style('fill', d => getFill(d.data.asset_operating_condition_state, d.data.is_asset_temp))
  node
    .filter(d => !['company', 'site'].includes(d.data.type))
    .append('foreignObject')
    .attr('class', 'asset-type-icon')
    .attr('x', 12)
    .attr('y', -25)
    .attr('width', 22)
    .attr('height', 22)
    .html(d => renderIconHtml(d.data.asset_class_type))
  node
    .filter(d => ['company', 'site'].includes(d.data.type))
    .append('foreignObject')
    .attr('class', 'asset-type-icon')
    .attr('x', 12)
    .attr('y', -25)
    .attr('width', 22)
    .attr('height', 22)
    .html(d => renderIconHtml(null, _.get(d, 'data.type', null)))
  node
    .append('text')
    // .attr('x', d => (d.data.is_subcomponent ? 5 : 13))
    // .attr('y', d => (d.data.is_subcomponent ? -15 : -7))
    .attr('x', d => (['company', 'site'].includes(d.data.type) ? 38 : !_.isEmpty(d.data.asset_class_type) ? 35 : 13))
    .attr('y', -10)
    .attr('font-size', '10px')
    .attr('fill', d => getTextFill(_.get(d, 'data.type', null), _.get(d, 'data.is_asset_temp', false), _.get(d, 'data.is_main_asset_assigned', false)))
    .attr('font-weight', d => getTextFontWeight(_.get(d, 'data.type', null), _.get(d, 'data.is_asset_temp', false), _.get(d, 'data.is_main_asset_assigned', false)))
    .text(d => `${d.data.name ? d.data.name.slice(0, 22) + (d.data.name && d.data.name.length > 22 ? '...' : '') : d.data.asset_name ? d.data.asset_name.slice(0, 22) + (d.data.asset_name && d.data.asset_name.length > 22 ? '...' : '') : ''}`)
    .style('font-style', d => (d.data.is_subcomponent || d.data.is_asset_temp || d.data.is_main_asset_assigned ? 'italic' : 'normal'))
  return node
}

const diagonal = (source, target) => {
  //console.log(source, target)
  return `M ${source.x} ${source.y} C ${source.x} ${(source.y + target.y) / 2},${target.x} ${(source.y + target.y) / 2},${target.x} ${target.y}`
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

export const pan = ({ g, dir }) => {
  const [x, y] = g
    .attr('transform')
    .match(/\((.*?)\)/g)
    .map(b => b.replace(/\(|(.*?)\)/g, '$1'))[0]
    .split(',')
    .map(d => Number(d))
  //
  const scale = g
    .attr('transform')
    .match(/\((.*?)\)/g)
    .map(b => b.replace(/\(|(.*?)\)/g, '$1'))[1]
  const [sx, sy] = !_.isEmpty(scale) ? scale.split(',').map(d => Number(d)) : [0, 0]

  let translateX, translateY
  if ([direction.left, direction.right].includes(dir)) {
    translateX = dir === direction.left ? x + panSpeed : x - panSpeed
    translateY = y
  } else {
    translateX = x
    translateY = dir === direction.up ? y + panSpeed : y - panSpeed
  }
  //
  const scaleTransform = !_.isEmpty(scale) ? `scale(${sx},${sy})` : ''
  g.transition().attr('transform', `translate(${translateX},${translateY})${scaleTransform} `)
}
