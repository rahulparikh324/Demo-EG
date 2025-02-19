import React from 'react'
import { Box, IconButton, Button } from '@material-ui/core'
import useContainerWidth from '../hooks/useContainerWidth'
// import {
//   GridToolbarContainer,
//   GridToolbarDensitySelector,
//   GridToolbarColumnsButton,
//   GridToolbarFilterButton,
//   GridToolbarQuickFilter,
//   GridToolbarExport,
// } from "@mui/x-data-grid";
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'
import UndoIcon from '@material-ui/icons/Undo'
import useChatStoreV2 from '../store/chatStoreV2'

function S3DataGridEditToolbar(props) {
  const [containerRef, containerWidth] = useContainerWidth()
  const isSmallContainer = containerWidth < 800
  const selectedFile = useChatStoreV2(state => state.selectedFile)

  const extractFileName = path => {
    const fullName = path.split('/').pop()
    const fileNameWithoutExtension = fullName.split('.')[0]
    return fileNameWithoutExtension
  }

  const fileName = extractFileName(selectedFile)

  return (
    <div ref={containerRef}>
      {/* <GridToolbarContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <GridToolbarQuickFilter />
            {!isSmallContainer && (
              <>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport
                  csvOptions={{
                    fileName: fileName,
                  }}
                />
              </>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {isSmallContainer ? (
              <>
                <IconButton color="primary" onClick={props.handleAddRow}>
                  <AddIcon />
                </IconButton>
                <IconButton
                  onClick={props.handleUndo}
                  disabled={props.history.length === 0}
                >
                  <UndoIcon />
                </IconButton>
                <IconButton color="secondary" onClick={props.handleSaveCSV}>
                  <SaveIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={props.handleAddRow}
                >
                  Add
                </Button>
                <Button
                  startIcon={<UndoIcon />}
                  onClick={props.handleUndo}
                  disabled={props.history.length === 0}
                >
                  Undo
                </Button>
                <Button
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={props.handleSaveCSV}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>
      </GridToolbarContainer> */}
    </div>
  )
}

export default S3DataGridEditToolbar
