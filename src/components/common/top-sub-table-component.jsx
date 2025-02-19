import React, { useRef, useCallback, useState } from 'react'

import { isEmpty } from 'lodash'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Tooltip, withStyles } from '@material-ui/core'

import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'

import { ActionButton } from 'components/common/buttons'
import TableLoader from 'components/TableLoader'

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    maxHeight: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip)

export const TopSubTableComponent = ({ data, columns, rowStyle = {}, enabledRowSelection, onRowClick = () => {}, setSelectedRow = () => {}, handlePageChange = () => {}, selectedRowKey = '', selectedRow = {}, isForViewAction = false, loading, hasFilters = false }) => {
  const [noTopLevelExpand, setNoTopLevelExpand] = useState({ ...data })
  const cols = columns.length

  const handleRowClick = d => {
    if (enabledRowSelection) setSelectedRow(d[selectedRowKey])
    onRowClick(d)
  }

  const expandHandle = data => {
    data.isExpanded = !data.isExpanded
    setNoTopLevelExpand({ ...data })
  }

  const observer = useRef()
  const lastElementRef = useCallback(
    node => {
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) handlePageChange()
        },
        { threshold: 0.75 }
      )
      if (node) observer.current.observe(node)
    },
    [handlePageChange]
  )
  const [isFilterEnabled, setFilterEnabled] = useState(false)

  const handleHeaderClick = () => {
    if (!hasFilters) return
    setFilterEnabled(!isFilterEnabled)
  }

  const style = { fontSize: '12px', fontWeight: 400 }

  return (
    <>
      <Table size='small' stickyHeader={true}>
        <TableHead>
          <TableRow>
            {columns.map((col, index) => (
              <TableCell onClick={handleHeaderClick} key={index} className={hasFilters ? 'table-header-filter' : ''}>
                {col.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        {loading && <TableLoader cols={cols} />}
        {isEmpty(data.topLevel) && isEmpty(data.noLevel) && (
          <TableBody>
            <TableRow>
              <TableCell colSpan={`${cols}`} className='Pendingtbl-no-datafound'>
                No data found
              </TableCell>
            </TableRow>
          </TableBody>
        )}
        <TableBody>
          {data.topLevel.map((row, index) => {
            const computedStyle = typeof rowStyle === 'function' ? rowStyle(row) : {}
            return (
              <React.Fragment key={index}>
                <HtmlTooltip placement='top' title={typeof rowStyle === 'function' ? (rowStyle(row).backgroundColor === '#ffebeb' ? 'Duplicate QR code in this WO line' : '') : ''}>
                  <TableRow style={{ ...computedStyle, minHeight: '32px' }} key={index} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]} className={isForViewAction ? 'table-with-row-click' : ''}>
                    {columns.map((col, index) => (
                      <TableCell key={index} style={{ ...style }} onClick={() => handleRowClick(row)}>
                        {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(row) : !isEmpty(row[col.accessor]) ? row[col.accessor] : 'NA'}
                      </TableCell>
                    ))}
                  </TableRow>
                </HtmlTooltip>
                {row.isExpanded &&
                  row.subLevelComponent?.map((sub, index) => {
                    const computedStyle = typeof rowStyle === 'function' ? rowStyle(sub) : {}
                    return (
                      <HtmlTooltip placement='top' title={typeof rowStyle === 'function' ? (rowStyle(row).backgroundColor === '#ffebeb' ? 'Duplicate QR code in this WO line' : '') : ''}>
                        <TableRow style={{ ...computedStyle, minHeight: '32px' }} key={index} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]} className={isForViewAction ? 'table-with-row-click' : ''}>
                          {columns.map((col, index) => {
                            return (
                              <TableCell key={index} style={{ width: col.width, ...style }} onClick={() => handleRowClick(sub)}>
                                {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(sub) : !isEmpty(sub[col.accessor]) ? sub[col.accessor] : 'NA'}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      </HtmlTooltip>
                    )
                  })}
              </React.Fragment>
            )
          })}
          {!isEmpty(data.noLevel) && (
            <>
              <TableRow style={{ ...rowStyle, minHeight: '32px' }}>
                <TableCell style={style} colSpan={columns.length}>
                  {data.isExpanded ? (
                    <ActionButton action={() => expandHandle(data)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} style={{ marginLeft: '-8px' }} />
                  ) : (
                    <ActionButton hide={isEmpty(data.noLevel)} action={() => expandHandle(data)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} style={{ marginLeft: '-8px' }} />
                  )}
                  <span className='text-bold'>Top-Level Component not present in this workorder</span>
                </TableCell>
              </TableRow>
              {data.isExpanded &&
                data.noLevel.map((row, index) => {
                  const computedStyle = typeof rowStyle === 'function' ? rowStyle(row) : {}
                  return (
                    <HtmlTooltip placement='top' title={typeof rowStyle === 'function' ? (rowStyle(row).backgroundColor === '#ffebeb' ? 'Duplicate QR code in this WO line' : '') : ''}>
                      <TableRow style={{ ...computedStyle, marginLeft: '10px' }} key={index} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]} className={isForViewAction ? 'table-with-row-click' : ''}>
                        {columns.map((col, index) => (
                          <TableCell key={index} style={{ ...style }} onClick={() => handleRowClick(row)}>
                            {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(row) : !isEmpty(row[col.accessor]) ? row[col.accessor] : 'NA'}
                          </TableCell>
                        ))}
                      </TableRow>
                    </HtmlTooltip>
                  )
                })}
            </>
          )}
        </TableBody>
      </Table>
    </>
  )
}
