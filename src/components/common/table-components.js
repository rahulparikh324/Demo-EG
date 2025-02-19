import React, { useRef, useCallback, useState } from 'react'

import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from 'components/TableLoader'
import { Tooltip, withStyles } from '@material-ui/core'

import { nanoid } from 'nanoid'
import { isEmpty } from 'lodash'

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

export const TableComponent = ({ columns, loading, data, rowStyle = {}, onRowClick = () => {}, selectedRowKey = '', enabledRowSelection, handlePageChange = () => {}, selectedRow = {}, setSelectedRow = () => {}, isForViewAction = false, hasFilters = false, isHover = false }) => {
  const cols = columns.length
  const style = { fontSize: '12px', fontWeight: 400 }
  const handleRowClick = d => {
    if (enabledRowSelection) setSelectedRow(d[selectedRowKey])
    onRowClick(d)
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
  //
  return (
    <Table size='small' stickyHeader={true}>
      <TableHead>
        <TableRow>
          {columns.map(col => (
            <TableCell onClick={handleHeaderClick} key={nanoid()} className={hasFilters ? 'table-header-filter' : ''}>
              {col.name}
            </TableCell>
          ))}
        </TableRow>
        {isFilterEnabled && (
          <TableRow>
            {columns.map(col => (
              <TableCell key={nanoid()}>{!isEmpty(col) && col.hasOwnProperty('filter') ? col.filter() : ''}</TableCell>
            ))}
          </TableRow>
        )}
      </TableHead>
      {loading ? (
        <TableLoader cols={cols} />
      ) : isEmpty(data) ? (
        <TableBody>
          <TableRow>
            <TableCell colSpan={`${cols}`} className={' Pendingtbl-no-datafound'}>
              No data found
            </TableCell>
          </TableRow>
        </TableBody>
      ) : (
        <TableBody>
          {data.map((row, index) => {
            return (
              <HtmlTooltip placement='top' title={typeof rowStyle === 'function' ? (rowStyle(row).backgroundColor === '#ffebeb' ? 'Duplicate QR code in this WO line' : '') : ''}>
                <TableRow key={nanoid()} style={typeof rowStyle === 'function' ? rowStyle(row) : rowStyle} onClick={() => handleRowClick(row)} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]} className={isForViewAction ? 'table-with-row-click' : ''}>
                  {columns.map(col => (
                    <TableCell style={style} key={`${nanoid()}-${col.accessor}`}>
                      {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(row) : !isEmpty(row[col.accessor]) ? row[col.accessor] : 'NA'}
                    </TableCell>
                  ))}
                </TableRow>
              </HtmlTooltip>
            )
          })}
        </TableBody>
      )}
    </Table>
  )
}
