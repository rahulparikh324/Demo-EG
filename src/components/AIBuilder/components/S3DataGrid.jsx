import React, { useState, useEffect } from 'react'
// import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { Box } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Delete as DeleteIcon, Save as SaveIcon, Close as CancelIcon, Check as CheckIcon } from '@material-ui/icons'
import Papa from 'papaparse'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import S3DataGridEditToolbar from './S3DataGridEditToolbar'
import useChatStoreV2 from '../store/chatStoreV2' // Correctly import Zustand store

const REGION = process.env.REACT_APP_VITE_AWS_REGION
const BUCKET_NAME = process.env.REACT_APP_VITE_S3_BUCKET_NAME
const ACCESS_KEY_ID = process.env.REACT_APP_VITE_AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.REACT_APP_VITE_AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
})

const fetchCSVFromS3 = async fileKey => {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey })
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    const response = await fetch(url)
    const text = await response.text()

    return text
  } catch (error) {
    console.error('Error fetching CSV file:', error)
  }
}

const saveCSVToS3 = async (fileKey, csvData) => {
  try {
    const csvWithoutId = csvData.map(({ id, isNew, ...rest }) => rest) // Omit the 'id' field
    const csv = Papa.unparse(csvWithoutId)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: csv,
      ContentType: 'text/csv',
    })
    await s3Client.send(command)
    console.log('CSV file saved to S3 successfully')
  } catch (error) {
    console.error('Error saving CSV file to S3:', error)
  }
}

const S3DataGrid = () => <>S3DataGrid</>

// const S3DataGrid = ({ fileKey }) => {
//   const [data, setData] = useState([]);
//   const [rowModesModel, setRowModesModel] = useState({});
//   const [paginationModel, setPaginationModel] = useState({
//     pageSize: 25,
//     page: 0,
//   });
//   const [density, setDensity] = useState("compact");

//   const [feedback, setFeedback] = useState({
//     message: "CSV not loaded.",
//     color: "grey",
//     timestamp: new Date().toLocaleString(),
//     loading: false,
//   });
//   const [alertProps, setAlertProps] = useState({
//     open: false,
//     severity: "success",
//     message: "",
//   });

//   const [history, setHistory] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setFeedback({
//         message: "Loading CSV...",
//         color: "grey",
//         timestamp: new Date().toLocaleString(),
//         loading: true,
//       });
//       const csvData = await fetchCSVFromS3(fileKey);
//       if (csvData) {
//         Papa.parse(csvData, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (results) => {
//             const data = results.data.map((row, index) => ({
//               id: index,
//               ...row,
//             }));
//             setData(data);
//             setFeedback({
//               message: "CSV loaded successfully.",
//               color: "green",
//               timestamp: new Date().toLocaleString(),
//               loading: false,
//             });
//             setAlertProps({
//               open: true,
//               severity: "success",
//               message: "CSV loaded successfully.",
//             });
//             setTimeout(() => {
//               setAlertProps((prev) => ({ ...prev, open: false }));
//             }, 3000); // Display the success message for 3 seconds
//           },
//         });
//       }
//     };

//     fetchData();
//   }, [fileKey]);

//   const handleSaveCSV = async () => {
//     setFeedback({
//       message: "Saving CSV...",
//       color: "grey",
//       timestamp: new Date().toLocaleString(),
//       loading: true,
//     });
//     try {
//       console.log("Saving CSV Data:", data); // Log current state of data
//       await saveCSVToS3(fileKey, data);
//       setFeedback({
//         message: "CSV saved successfully.",
//         color: "green",
//         timestamp: new Date().toLocaleString(),
//         loading: false,
//       });
//       setAlertProps({
//         open: true,
//         severity: "success",
//         message: "CSV saved successfully.",
//       });
//     } catch (error) {
//       setFeedback({
//         message: "Error saving CSV.",
//         color: "red",
//         timestamp: new Date().toLocaleString(),
//         loading: false,
//       });
//       setAlertProps({
//         open: true,
//         severity: "error",
//         message: "Error saving CSV.",
//       });
//     }
//     setTimeout(() => {
//       setAlertProps((prev) => ({ ...prev, open: false }));
//     }, 3000); // Display the success/error message for 3 seconds
//   };

//   const processRowUpdate = (newRow) => {
//     const updatedRows = data.map((row) =>
//       row.id === newRow.id ? { ...newRow, isNew: false } : row
//     );
//     setHistory((prev) => [...prev, data]);
//     setData(updatedRows);
//     return newRow;
//   };

//   const handleRowEditStop = (params, event) => {
//     if (params.reason === "rowFocusOut") {
//       event.defaultMuiPrevented = true;
//     }
//   };

//   const handleSaveClick = (id) => () => {
//     setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
//   };

//   const handleDeleteClick = (id) => () => {
//     setHistory((prev) => [...prev, data]);
//     if (data.length > 1) {
//       setData(data.filter((row) => row.id !== id));
//     }
//   };

//   const handleCancelClick = (id) => () => {
//     setRowModesModel({
//       ...rowModesModel,
//       [id]: { mode: GridRowModes.View, ignoreModifications: true },
//     });

//     const editedRow = data.find((row) => row.id === id);
//     if (editedRow.isNew) {
//       setHistory((prev) => [...prev, data]);
//       setData(data.filter((row) => row.id !== id));
//     }
//   };

//   const handleAddRow = () => {
//     const id = Date.now();
//     const newRow = { id, isNew: true };

//     const firstField = columns[0]?.field;

//     setHistory((prev) => [...prev, data]);
//     setData((prevData) => {
//       const newData = [...prevData, newRow];

//       const totalPages = Math.ceil(newData.length / paginationModel.pageSize);

//       setRowModesModel((oldModel) => ({
//         ...oldModel,
//         [id]: { mode: GridRowModes.Edit, fieldToFocus: firstField },
//       }));

//       return newData;
//     });

//     setTimeout(() => {
//       setPaginationModel((prevModel) => {
//         const totalPages = Math.ceil(
//           (data.length + 1) / paginationModel.pageSize
//         );
//         return {
//           ...prevModel,
//           page: totalPages - 1,
//         };
//       });
//     }, 0);
//   };

//   const handleUndo = () => {
//     if (history.length > 0) {
//       const lastState = history[history.length - 1];
//       setHistory(history.slice(0, -1));
//       setData(lastState);
//       setAlertProps({
//         open: true,
//         severity: "info",
//         message: "Action undone.",
//       });
//       setTimeout(() => {
//         setAlertProps((prev) => ({ ...prev, open: false }));
//       }, 3000); // Display the undo message for 3 seconds
//     }
//   };

//   const columns = data.length
//     ? Object.keys(data[0])
//         .filter((field) => field !== "id" && field !== "isNew")
//         .map((field) => ({
//           field,
//           headerName: field,
//           flex: 1,
//           editable: true,
//         }))
//     : [];

//   columns.push({
//     field: "actions",
//     type: "actions",
//     headerName: "Actions",
//     hideable: false,
//     flex: 0.5,
//     cellClassName: "actions",
//     getActions: ({ id }) => {
//       const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

//       if (isInEditMode) {
//         return [
//           <GridActionsCellItem
//             key={`${id}-save`}
//             icon={<SaveIcon />}
//             label="Save"
//             onClick={handleSaveClick(id)}
//             color="primary"
//           />,
//           <GridActionsCellItem
//             key={`${id}-cancel`}
//             icon={<CancelIcon />}
//             label="Cancel"
//             onClick={handleCancelClick(id)}
//             color="inherit"
//           />,
//         ];
//       }

//       return [
//         <GridActionsCellItem
//           key={`${id}-delete`}
//           icon={<DeleteIcon />}
//           label="Delete"
//           onClick={handleDeleteClick(id)}
//           color="inherit"
//           disabled={data.length === 1}
//         />,
//       ];
//     },
//   });

//   return (
//     <Box
//       sx={{
//         height: "100%",
//         width: "100%",
//         position: "relative",
//         flexGrow: 1,
//       }}
//     >
//       {alertProps.open && (
//         <Alert
//           icon={<CheckIcon fontSize="inherit" />}
//           severity={alertProps.severity}
//           sx={{
//             position: "fixed",
//             top: 32, // Positioning the alert above the DataGrid
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 10,
//             width: "fit-content",
//           }}
//         >
//           {alertProps.message}
//         </Alert>
//       )}
//       <DataGrid
//         rows={data}
//         columns={columns}
//         processRowUpdate={processRowUpdate}
//         onRowEditStop={handleRowEditStop}
//         editMode="row"
//         pagination
//         density={density}
//         onDensityChange={(newDensity) => setDensity(newDensity)}
//         paginationModel={paginationModel}
//         onPaginationModelChange={(model) => setPaginationModel(model)}
//         pageSizeOptions={[10, 25, 100]}
//         rowModesModel={rowModesModel}
//         onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
//         slots={{
//           toolbar: S3DataGridEditToolbar,
//         }}
//         slotProps={{
//           toolbar: {
//             setData,
//             setRowModesModel,
//             handleSaveCSV,
//             handleAddRow,
//             handleUndo,
//             history,
//           },
//         }}
//         sx={{
//           flexGrow: 1,
//           height: 1,
//           "& .MuiDataGrid-main": {
//             minHeight: 0,
//           },
//           "& .MuiDataGrid-columnHeaderTitle": {
//             fontWeight: "bold",
//           },
//           "& .MuiDataGrid-virtualScroller": {
//             maxHeight: 1,
//           },
//         }}
//       />
//       <Box
//         sx={{
//           color: "grey",
//           mt: 3,
//           fontSize: 11,
//           textAlign: "left",
//         }}
//       >
//         Last updated in session: {feedback.timestamp}
//       </Box>
//     </Box>
//   );
// };

export default S3DataGrid
