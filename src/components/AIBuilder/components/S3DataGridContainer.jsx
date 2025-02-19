import React from 'react'
import { Container } from '@material-ui/core'
import S3DataGrid from './S3DataGrid'

export default function S3DataGridContainer(props) {
  return (
    <Container
      sx={{
        height: props.height,
        width: props.width,
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        position: 'relative',
        maxWidth: 'xlg',
      }}
    >
      <S3DataGrid fileKey={props.fileKey} />
    </Container>
  )
}
