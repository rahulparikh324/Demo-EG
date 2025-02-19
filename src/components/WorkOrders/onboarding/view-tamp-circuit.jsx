import React, { useEffect, useState } from 'react'

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

import { get, isEmpty } from 'lodash'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  table: {
    '& th': {
      fontWeight: 'bold',
      border: '1px solid rgba(224, 224, 224, 1)',
      padding: '10px 8px 5px 10px',
    },
    '& td': {
      border: '1px solid rgba(224, 224, 224, 1)',
      textAlign: 'center',
      padding: '0px 0px 0px 0px',
    },
  },
})

const ViewTampCircuit = ({ onClose, dataList = [], nameplate, issues = false }) => {
  const classes = useStyles()
  const [circuitData, setCircuitData] = useState([])
  const [items, setItems] = useState(0)
  const [skipRows, setSkipRows] = useState([])
  const [rowMap, setRowMap] = useState([])

  useEffect(() => {
    if (!isEmpty(nameplate)) {
      setItems(get(nameplate, ['size', 'value'], 0))
    }
  }, [nameplate])

  useEffect(() => {
    if (items < 2) {
      setCircuitData([]) // Clear circuit data if items are less than 2
      setRowMap([])
      setSkipRows([])
      return
    }

    let itemsArray = []
    for (let row = 1; row <= items; row++) {
      itemsArray.push({
        circuit: row,
        firstOcp: '',
        firstAmp: '',
        secOcp: '',
        secAmp: '',
        canMerge: true,
      })
    }

    dataList?.forEach(dataItem => {
      const circuits = dataItem.circuit?.split(',').map(Number)
      circuits?.forEach(circuit => {
        const circuitParts = circuit.toString()?.split('.')
        const circuitNumber = parseInt(circuitParts[0])
        const decimalPart = circuitParts[1] ? parseFloat(`0.${circuitParts[1]}`) : 0

        if (circuitNumber > 0 && circuitNumber <= items) {
          const index = circuitNumber - 1 // Adjusting for zero-based index
          if (decimalPart === 0) {
            // Handle cases where the circuit number is like 1 or 1.1
            itemsArray[index].firstOcp = dataItem.fedByViaSubcomponantAssetName
            itemsArray[index].firstAmp = dataItem.amps
            itemsArray[index].canMerge = true
          } else if (decimalPart === 0.1) {
            itemsArray[index].firstOcp = dataItem.fedByViaSubcomponantAssetName
            itemsArray[index].firstAmp = dataItem.amps
            itemsArray[index].canMerge = false
          } else if (decimalPart === 0.2) {
            // Handle cases where the circuit number is like 1.2
            itemsArray[index].secOcp = dataItem.fedByViaSubcomponantAssetName
            itemsArray[index].secAmp = dataItem.amps
          }
        }
      })
    })
    let data = itemsArray
    if (data.length > 0) {
      let Keys = []
      let oddTempFirstOcp = data[0].firstOcp
      let oddTempSecondOcp = data[0].secOcp

      let evenTempFirstOcp = data[1].firstOcp
      let evenTempSecondOcp = data[1].secOcp

      let oddStartIndex = data[0].circuit
      let oddEndIndex = 0
      let ods = data.find(d => d.secOcp === '' && d.firstOcp !== '')?.circuit || 0
      ods = ods + 2

      let evenStartIndex = data[1].circuit
      let evenEndIndex = 0
      let eds = data.find(d => d.secOcp === '' && d.firstOcp !== '')?.circuit || 0
      eds = eds + 2

      data = data.filter(d => d.secOcp === '' && d.canMerge)
      data.forEach(d => {
        if (d.circuit % 2 == 1 && d.firstOcp != '' && d.firstOcp === oddTempFirstOcp && d.secOcp === oddTempSecondOcp && (d.circuit - ods == 2 || d.circuit == 1)) {
          oddEndIndex = d.circuit
        } else if (d.circuit % 2 == 1) {
          const newKey = oddStartIndex + '-' + oddEndIndex
          Keys.push(newKey)
          oddStartIndex = d.circuit
          oddEndIndex = oddStartIndex
          oddTempFirstOcp = d.firstOcp
          oddTempSecondOcp = d.secOcp
        }
        ods = d.circuit % 2 == 1 ? d.circuit : ods

        if (d.circuit % 2 == 0 && d.firstOcp != '' && d.firstOcp === evenTempFirstOcp && d.secOcp === evenTempSecondOcp && (d.circuit - eds == 2 || d.circuit == 2)) {
          evenEndIndex = d.circuit
        } else if (d.circuit % 2 == 0) {
          const newKey = evenStartIndex + '-' + evenEndIndex
          Keys.push(newKey)
          evenStartIndex = d.circuit
          evenEndIndex = evenStartIndex
          evenTempFirstOcp = d.firstOcp
          evenTempSecondOcp = d.secOcp
        }
        eds = d.circuit % 2 == 0 ? d.circuit : eds
      })

      Keys.push(oddStartIndex + '-' + oddEndIndex)
      Keys.push(evenStartIndex + '-' + evenEndIndex)

      Keys = Keys.filter(d => d.split('-')[0] !== d.split('-')[1])

      const finalKeys = []
      const finalSkipRows = []

      Keys.forEach(d => {
        let start = +d.split('-')[0]
        let end = +d.split('-')[1]

        let tempKeys = []
        for (let i = start; i <= end; i = i + 2) {
          tempKeys.push(i)
          finalSkipRows.push(Math.min(i + 2, end))
        }
        let samekydata = data.filter(f => tempKeys.includes(f.circuit))

        if (samekydata.length > 0) {
          let ss = samekydata[0].circuit
          let ee = samekydata.at(-1).circuit

          // console.log("samekydata ==> ", samekydata);
          samekydata.forEach(z => {
            if (z.secOcp !== '') {
              ss = z.circuit
            }
          })

          finalKeys.push(ss + '-' + ee)
        }
      })
      // console.log(finalSkipRows)
      setRowMap(finalKeys)
      setSkipRows(finalSkipRows)
      // console.log({
      //   finalKeys,
      //   finalSkipRows,
      // })
    }
    // console.log(itemsArray)
    setCircuitData(itemsArray)
  }, [dataList, items])

  return (
    <div className='table-responsive d-flex' id='style-1' style={{ height: issues ? 'calc(100vh - 235px)' : 'calc(100vh - 134px)' }}>
      <div style={{ padding: issues ? '0 10px' : '10px', width: '51vw' }}>
        <div style={{ background: '#fff', borderRadius: '4px', height: issues ? 'calc(100vh - 240px)' : 'calc(100vh - 147px)' }} className='table-responsive' id='style-1'>
          <div className='d-flex justify-content-between align-items-center' style={{ padding: '6px 10px', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
            <strong style={{ fontSize: '14px' }}>SCHEDUAL CIRCUIT DETAILS</strong>
            <IconButton aria-label='close' size='small' onClick={onClose}>
              <CloseIcon style={{ cursor: 'pointer' }} />
            </IconButton>
          </div>
          <div style={{ marginTop: '10px', padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <div className={classes.container}>
              <TableContainer className={classes.table}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center' style={{ width: '78px' }}>
                        Circuit #
                      </TableCell>
                      <TableCell align='center'>Amps</TableCell>
                      <TableCell align='center'>OCP Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {circuitData
                      ?.filter(val => val.circuit % 2 !== 0)
                      .map(d => {
                        const tamp = rowMap.find(v => v.split('-')[0] == d.circuit)
                        const emptycell = d.firstOcp && !d.secOcp && d.canMerge === true
                        return (
                          <TableRow key={d.circuit}>
                            <TableCell align='center' style={{ height: '100px', width: '78px' }}>
                              {d.circuit}
                            </TableCell>
                            {!skipRows.includes(d.circuit) && (
                              <TableCell align='center' rowSpan={tamp ? (tamp.split('-')[1] - tamp.split('-')[0] + 2) / 2 : 1}>
                                {!tamp ? (
                                  <>
                                    <div style={{ borderBottom: emptycell ? '' : '1px solid #e0e0e0', height: emptycell ? '80px' : '40px', paddingTop: emptycell ? '30px' : '10px' }}>{d.firstAmp}</div>
                                    {!emptycell && <div style={{ height: '40px', paddingTop: '10px' }}>{d.secAmp}</div>}
                                  </>
                                ) : (
                                  <>
                                    <div style={{ height: '80px', paddingTop: '30px' }}>{d.firstAmp}</div>
                                  </>
                                )}
                              </TableCell>
                            )}
                            {!skipRows.includes(d.circuit) && (
                              <TableCell align='center' rowSpan={tamp ? (tamp.split('-')[1] - tamp.split('-')[0] + 2) / 2 : 1}>
                                {!tamp ? (
                                  <>
                                    <div style={{ borderBottom: emptycell ? '' : '1px solid #e0e0e0', height: emptycell ? '80px' : '40px', paddingTop: emptycell ? '30px' : '10px' }}>{d.firstOcp}</div>
                                    {!emptycell && <div style={{ height: '40px', paddingTop: '10px' }}>{d.secOcp}</div>}
                                  </>
                                ) : (
                                  <>
                                    <div style={{ height: '80px', paddingTop: '30px' }}>{d.firstOcp}</div>
                                  </>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer className={classes.table}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>OCP Name</TableCell>
                      <TableCell align='center'>Amps</TableCell>
                      <TableCell align='center' style={{ width: '78px' }}>
                        Circuit #
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {circuitData
                      ?.filter(val => val.circuit % 2 === 0)
                      .map(d => {
                        const tamp = rowMap.find(v => v.split('-')[0] == d.circuit)
                        const emptycell = d.firstOcp && !d.secOcp && d.canMerge === true
                        return (
                          <TableRow key={d.circuit}>
                            {!skipRows.includes(d.circuit) && (
                              <TableCell align='center' rowSpan={tamp ? (tamp.split('-')[1] - tamp.split('-')[0] + 2) / 2 : 1}>
                                {!tamp ? (
                                  <>
                                    <div style={{ borderBottom: emptycell ? '' : '1px solid #e0e0e0', height: emptycell ? '80px' : '40px', paddingTop: emptycell ? '30px' : '10px' }}>{d.firstOcp}</div>
                                    {!emptycell && <div style={{ height: '40px', paddingTop: '10px' }}>{d.secOcp}</div>}
                                  </>
                                ) : (
                                  <>
                                    <div style={{ height: '80px', paddingTop: '30px' }}>{d.firstOcp}</div>
                                  </>
                                )}
                              </TableCell>
                            )}
                            {!skipRows.includes(d.circuit) && (
                              <TableCell align='center' rowSpan={tamp ? (tamp.split('-')[1] - tamp.split('-')[0] + 2) / 2 : 1}>
                                {!tamp ? (
                                  <>
                                    <div style={{ borderBottom: emptycell ? '' : '1px solid #e0e0e0', height: emptycell ? '80px' : '40px', paddingTop: emptycell ? '30px' : '10px' }}>{d.firstAmp}</div>
                                    {!emptycell && <div style={{ height: '40px', paddingTop: '10px' }}>{d.secAmp}</div>}
                                  </>
                                ) : (
                                  <>
                                    <div style={{ height: '80px', paddingTop: '30px' }}>{d.firstAmp}</div>
                                  </>
                                )}
                              </TableCell>
                            )}

                            <TableCell align='left' style={{ height: '100px', width: '78px' }}>
                              {d.circuit}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewTampCircuit
