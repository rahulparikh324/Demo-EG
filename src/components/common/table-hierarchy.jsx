import React, { useRef, useCallback, useState } from 'react'

import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from 'components/TableLoader'

import { nanoid } from 'nanoid'
import { isEmpty, get } from 'lodash'

export const TableHierarchy = ({ columns, loading, data, rowStyle = {}, onRowClick = () => {}, selectedRowKey = '', enabledRowSelection, handlePageChange = () => {}, selectedRow = {}, setSelectedRow = () => {}, isForViewAction = false, hasFilters = false, subAssetKey }) => {
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
              <React.Fragment key={nanoid()}>
                <TableRow style={rowStyle} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]}>
                  {columns.map(col => (
                    <TableCell style={style} key={`${nanoid()}-${col.accessor}`}>
                      {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(row) : !isEmpty(row[col.accessor]) ? row[col.accessor] : ''}
                    </TableCell>
                  ))}
                </TableRow>
                {row.isExpanded &&
                  get(row, [subAssetKey], []).map((sub, index) => {
                    return (
                      <TableRow key={nanoid()} style={rowStyle} onClick={() => handleRowClick(sub)} ref={data.length === index + 1 ? lastElementRef : null} selected={!isEmpty(selectedRowKey) && selectedRow === row[selectedRowKey]} className={isForViewAction ? 'table-with-row-click' : ''}>
                        {columns.map(col => (
                          <TableCell style={style} key={`${nanoid()}-${col.accessor}`}>
                            {!isEmpty(col) && col.hasOwnProperty('render') ? col.render(sub) : !isEmpty(sub[col.accessor]) ? sub[col.accessor] : 'NA'}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
              </React.Fragment>
            )
          })}
        </TableBody>
      )}
    </Table>
  )
}
