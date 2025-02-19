import XLSX from 'sheetjs-style'

import { startCase, get, isEmpty, upperCase, omit, isArray, camelCase, isNumber, merge as _merge, reject, isObject } from 'lodash'
import { createSequence, footer } from 'components/WorkOrders/spreadsheet/utils'

import workorder from 'Services/WorkOrder/common'
import { Toast } from 'Snackbar/useToast'
import $ from 'jquery'

const mapNumberToCharacter = number => {
  var result = ''
  var baseCharCode = 'A'.charCodeAt(0) - 1

  while (number > 0) {
    var remainder = number % 26 || 26
    result = String.fromCharCode(baseCharCode + remainder) + result
    number = Math.floor((number - remainder) / 26)
  }

  return result
}
const headerStyle = {
  font: {
    name: 'Trebuchet MS',
    sz: 10,
    bold: true,
  },
  alignment: {
    vertical: 'center',
    horizontal: 'center',
  },
  fill: {
    patternType: 'solid',
    bgColor: { rgb: 'F2F2F2' },
    fgColor: { rgb: 'F2F2F2' },
  },
  border: {
    left: { style: 'thin', color: { rgb: 'C3C3C3' } },
    right: { style: 'thin', color: { rgb: 'C3C3C3' } },
    top: { style: 'thin', color: { rgb: 'C3C3C3' } },
    bottom: { style: 'thin', color: { rgb: 'C3C3C3' } },
  },
}
const columnStyle = {
  font: {
    name: 'Trebuchet MS',
    sz: 10,
  },
  alignment: {
    vertical: 'center',
    horizontal: 'center',
  },
  fill: {
    patternType: 'solid',
    bgColor: { rgb: 'E3E3E3' },
    fgColor: { rgb: 'E3E3E3' },
  },
  border: {
    left: { style: 'thin', color: { rgb: 'C3C3C3' } },
    right: { style: 'thin', color: { rgb: 'C3C3C3' } },
    top: { style: 'thin', color: { rgb: 'C3C3C3' } },
    bottom: { style: 'thin', color: { rgb: 'C3C3C3' } },
  },
}

export const bulkExport = async workOrder => {
  //console.log('export-bulk')
  $('#pageLoading').show()
  try {
    const { data: res } = await workorder.getFormDataForBulkOpertaion(workOrder.woId)
    const wb = XLSX.utils.book_new()
    if (!isEmpty(res)) {
      const categories = get(res, 'formCategoryList', [])
      for (const category of categories) {
        const cat = get(workOrder, 'formCategoryList', []).find(d => d.woInspectionsTemplateFormIoAssignmentId === category.woInspectionsTemplateFormIoAssignmentId)
        const sheetName = `${cat.groupString ? cat.groupString : 'NA'}-${cat.formName}`.slice(0, 29)
        const formData = get(res, 'masterForms', []).find(d => d.formId === cat.formId)
        //creating template with empty values for data
        const templateRes = await workorder.getFormDataTemplate(cat.formId)
        const dataTemplate = get(templateRes, 'data.formOutputDataTemplate', {})
        let { data: template } = !isEmpty(dataTemplate) ? JSON.parse(dataTemplate) : { data: {} }
        //
        const form = JSON.parse(formData.formData)
        const sectionSequence = createSequence(form)
        sectionSequence.push('mappingIds')
        //
        const columnGroupHeaders = []
        const merge = []
        const cols = []
        const cols2 = []
        const rows = []
        const cellwidth = []
        const metaData = []
        let maxMulipleEntryForRow = 1
        //
        get(category, 'taskList', []).forEach((task, index) => {
          //reset template
          if (!isEmpty(template)) template.footer = footer
          Object.keys(template).forEach(d => {
            const keys = Object.keys(template[d]).filter(x => !['copyright', 'selection1', 'defectPhotos', 'selectRepairIssues'].includes(x))
            keys.forEach(x => {
              if (isArray(template[d][x])) {
                const obj = template[d][x][0]
                Object.keys(obj).forEach(q => (obj[q] = ''))
                template[d][x] = [obj]
              } else if (!isObject(template[d])) {
                template[d] = template[d]
              } else template[d][x] = ''
            })
          })
          //
          const d = JSON.parse(get(task, 'taskForm.assetFormData', {}))
          const formattedData = _merge(template, d.data)
          const data = {
            ...omit(formattedData, ['pleaseSelectTests']),
            mappingIds: {
              assetFormId: task.taskForm.assetFormId,
              taskMappingId: task.wOcategorytoTaskMappingId,
              assignmentId: task.woInspectionsTemplateFormIoAssignmentId,
            },
          }
          const row = []
          const multipleData = {}
          // create data
          if (!index) {
            //create column and header groups
            sectionSequence.forEach(d => {
              if (isEmpty(data[d])) return
              const keys = Object.keys(data[d]).filter(x => !['copyright', 'selection1', 'defectPhotos', 'selectRepairIssues', 'selectReplacementIssues'].includes(x))
              if (!index) {
                if (keys.length) {
                  let arrayOccurances = 0
                  let arrayColsCount = 0
                  keys.forEach(x => {
                    if (isArray(data[d][x])) {
                      arrayOccurances += 1
                      arrayColsCount += Object.keys(data[d][x][0]).length
                      cols.push({ header: x, colspan: Object.keys(data[d][x][0]).length })
                      if (data[d][x].slice(1).length > 0) multipleData[`${d}.${x}`] = { data: data[d][x].slice(1), index: cellwidth.length }
                      Object.keys(data[d][x][0]).forEach(e => {
                        if (isNumber(data[d][x][0][e])) data[d][x][0][e] = `${data[d][x][0][e]}`
                        cols2.push(startCase(e))
                        cellwidth.push(startCase(e))
                        row.push(get(data[d], [x, 0, e], '') || '')
                      })
                      if (data[d][x].length > maxMulipleEntryForRow) maxMulipleEntryForRow = data[d][x].length
                    } else {
                      if (isNumber(data[d][x])) data[d][x] = `${data[d][x]}`
                      cols.push({ header: x, colspan: 1 })
                      cols2.push('')
                      cellwidth.push(x)
                      row.push(get(data[d], [x], '') || '')
                    }
                  })
                  columnGroupHeaders.push({ header: upperCase(d), colspan: keys.length - arrayOccurances + arrayColsCount })
                }
              }
            })
            metaData.push({ rowStartIndex: 3, maxSubDataLength: maxMulipleEntryForRow, multipleData })
            rows.push(cols)
            rows.push(cols)
            rows.push(cols2)
            rows.push(row)
          } else {
            let max = 1
            sectionSequence.forEach(d => {
              if (isEmpty(data[d])) return
              const keys = Object.keys(data[d]).filter(x => !['copyright', 'selection1', 'defectPhotos', 'selectRepairIssues', 'selectReplacementIssues'].includes(x))
              if (keys.length) {
                keys.forEach(x => {
                  if (isArray(data[d][x])) {
                    if (data[d][x].slice(1).length > 0) {
                      const firstKey = startCase(Object.keys(data[d][x][0])[0])
                      multipleData[`${d}.${x}`] = { data: data[d][x].slice(1), index: cols2.indexOf(firstKey) }
                    }
                    Object.keys(data[d][x][0]).forEach(e => {
                      if (isNumber(data[d][x][0][e])) data[d][x][0][e] = `${data[d][x][0][e]}`
                      if (isObject(data[d][x][0][e])) data[d][x][0][e] = ''
                      row.push(get(data[d], [x, 0, e], '') || '')
                    })
                    if (data[d][x].length > max) max = data[d][x].length
                  } else {
                    if (isNumber(data[d][x])) data[d][x] = `${data[d][x]}`
                    if (isObject(data[d][x])) data[d][x] = ``
                    const val = data[d][x] || ''
                    row.push(val.trim())
                  }
                })
              }
            })
            metaData.push({ rowStartIndex: metaData[metaData.length - 1]['rowStartIndex'] + metaData[metaData.length - 1]['maxSubDataLength'], maxSubDataLength: max, multipleData })
            rows.push(row)
          }
          //multi data
          const hasMultipleData = metaData[index].maxSubDataLength > 1
          if (hasMultipleData) {
            for (let i = 0; i < metaData[index].maxSubDataLength - 1; i++) {
              const row = new Array(cellwidth.length).fill('')
              Object.keys(metaData[index].multipleData).forEach(key => {
                const firstObj = metaData[index].multipleData[key]['data'][0]
                const data = metaData[index].multipleData[key]['data'][i]
                const idx = metaData[index].multipleData[key]['index']
                for (let x = idx; x < idx + Object.keys(firstObj).length; x++) {
                  row[x] = isEmpty(data) ? '' : data[camelCase(cols2[x])]
                  if (isNumber(row[x])) row[x] = `${row[x]}`
                }
              })
              rows.push(row)
            }
          }
        })
        const ws = XLSX.utils.aoa_to_sheet(rows, { skipHeader: true })
        // add header groups
        let startIndex = 0
        columnGroupHeaders.forEach(d => {
          const cell = mapNumberToCharacter(startIndex + 1) + `1`
          ws[cell] = { t: 's', v: d.header }
          ws[cell].s = headerStyle
          merge.push({ s: { r: 0, c: startIndex }, e: { r: 0, c: startIndex + d.colspan - 1 } })
          startIndex += d.colspan
        })
        ws[`${mapNumberToCharacter(cols2.length)}1`] = { t: 's', v: null, s: headerStyle }
        // add columns
        let colStartIndex = 0
        cols.forEach(d => {
          const mappedCol = mapNumberToCharacter(colStartIndex + 1)
          const cell = mappedCol + `2`
          ws[cell] = { t: 's', v: startCase(d.header) }
          ws[cell].s = columnStyle
          merge.push({ s: { r: 1, c: colStartIndex }, e: { r: 1, c: colStartIndex + d.colspan - 1 } })
          const cellBelowCurrent = mappedCol + `3`
          ws[cellBelowCurrent].s = columnStyle
          if (isEmpty(get(ws[cellBelowCurrent], 'v', ''))) {
            merge.push({ s: { r: 1, c: colStartIndex }, e: { r: 2, c: colStartIndex + d.colspan - 1 } })
          }
          if (d.colspan > 1) {
            for (let index = colStartIndex; index < colStartIndex + d.colspan + 1; index++) {
              if (!isEmpty(get(ws[`${mapNumberToCharacter(index)}2`], 'v', ''))) ws[`${mapNumberToCharacter(index)}2`].s = columnStyle
              else ws[`${mapNumberToCharacter(index)}2`] = { t: 's', v: null, s: columnStyle }
              if (ws[`${mapNumberToCharacter(index)}3`]) ws[`${mapNumberToCharacter(index)}3`].s = columnStyle
              else ws[`${mapNumberToCharacter(index)}3`] = { t: 's', v: null, s: columnStyle }
            }
          }
          colStartIndex += d.colspan
        })
        // add rows
        //console.log(rows)
        let rowStartIndex = 3
        rows.forEach((x, ind) => {
          if (ind === rowStartIndex) {
            const metaDataForColspan = metaData.find(d => d.rowStartIndex === rowStartIndex)
            cols2.forEach((d, colIndex) => {
              const mapped = mapNumberToCharacter(colIndex + 1)
              const cell = `${mapped}${rowStartIndex + 1}`
              if (ws[cell]) ws[cell].s = { font: { ...columnStyle.font } }
              else ws[cell] = { t: 's', v: null, s: { font: { ...columnStyle.font } } }
              //
              let rowCellIndex = ind
              for (let i = rowCellIndex; i < ind + metaDataForColspan.maxSubDataLength; i++) {
                for (let j = i + 1; j < ind + metaDataForColspan.maxSubDataLength; j++) {
                  if (!isEmpty(get(ws[`${mapped}${j + 1}`], 'v', ''))) {
                    ws[`${mapped}${j + 1}`].s = { font: { ...columnStyle.font } }
                    break
                  } else {
                    merge.push({ s: { r: i, c: colIndex }, e: { r: j, c: colIndex } })
                  }
                }
              }
            })
            rowStartIndex += metaDataForColspan.maxSubDataLength
          }
        })
        // merges
        const firstColMerges = merge.filter(m => m.s.r > 2 && m.s.c === 0)
        const firstColStartIndexes = [...new Set(firstColMerges.map(d => d.s.r))]
        const maxMerges = []
        firstColStartIndexes.forEach(startIndex => {
          let maxDif = 0
          let maxMerge
          const merges = firstColMerges.filter(m => m.s.r === startIndex)
          merges.forEach(m => {
            if (m.e.r - m.s.r > maxDif) {
              maxDif = m.e.r - m.s.r
              maxMerge = m
            }
          })
          maxMerges.push(maxMerge)
        })
        //
        let maxDif = 0
        let maxMerge
        maxMerges.forEach(m => {
          if (m.e.r - m.s.r > maxDif) {
            maxDif = m.e.r - m.s.r
            maxMerge = m
          }
        })
        //
        const otherMerges = reject(merge, m => m.s.r > 2 && m.s.c === 0)
        ws['!merges'] = isEmpty(maxMerge) ? otherMerges : [...otherMerges, maxMerge]

        ws['!cols'] = cellwidth.map((d, i) => ([cellwidth.length - 1, cellwidth.length - 2, cellwidth.length - 3].includes(i) ? { wch: 44 } : { wch: d.length + 8 }))
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      }
    }

    XLSX.writeFile(wb, `${workOrder.manualWoNumber}.xlsx`)
    $('#pageLoading').hide()
  } catch (error) {
    console.log(error)
    Toast.error('Error exporting data')
    $('#pageLoading').hide()
  }
}
