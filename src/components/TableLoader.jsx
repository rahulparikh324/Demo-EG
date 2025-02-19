import React from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Skeleton from '@material-ui/lab/Skeleton'

function Row({ cols }) {
  return (
    <TableRow>
      {[...Array(cols)].map((x, index) => (
        <TableCell key={index} className='loader-table-cell'>
          <Skeleton variant='text' animation='wave' />
        </TableCell>
      ))}
    </TableRow>
  )
}

function TableLoader({ cols, rows }) {
  const n = rows || 20
  return (
    <TableBody>
      {[...Array(n)].map((x, index) => (
        <Row key={index} cols={cols} />
      ))}
    </TableBody>
  )
}

export default TableLoader
