import XLSX from 'sheetjs-style'
import { camelCase, isEmpty, isNumber, cloneDeep, omit, get } from 'lodash'

import * as AWS from 'aws-sdk'
import { bucket } from 'Constants/aws-config'
import JSZip from 'jszip'
import $ from 'jquery'

const checkIfAllCategoryPresent = (wb, presentCategoryIds) => {
  const sheetNames = wb.SheetNames
  let isCategoryPresent = true
  for (let index = 0; index < sheetNames.length; index++) {
    const sheet = sheetNames[index]
    const ws = wb.Sheets[sheet]
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
    const firstLineData = data[3]
    const categoryId = !isEmpty(firstLineData) ? firstLineData[firstLineData.length - 1] : null
    if (!presentCategoryIds.includes(categoryId)) {
      isCategoryPresent = false
      break
    }
  }
  return isCategoryPresent
}

export const bulkImport = async (wb, workOrder) => {
  return new Promise((resolve, reject) => {
    $('#pageLoading').show()
    try {
      const wB = XLSX.utils.book_new()
      const sheetNames = wb.SheetNames
      const presentCategoryIds = get(workOrder, 'formCategoryList', []).map(d => d.woInspectionsTemplateFormIoAssignmentId)
      const doesAllCategoryPresent = checkIfAllCategoryPresent(wb, presentCategoryIds)
      if (doesAllCategoryPresent) {
        sheetNames.forEach(sheet => {
          const ws = wb.Sheets[sheet]
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
          const submissionData = {}
          //obj creation
          const columnGroupHeaders = data[0]
          let spannedHeader = ''
          let spannedColumn = ''
          for (let index = 0; index < columnGroupHeaders.length; index++) {
            //header
            if (isEmpty(columnGroupHeaders[index]) || columnGroupHeaders[index] === 'null') columnGroupHeaders[index] = spannedHeader
            else {
              columnGroupHeaders[index] = camelCase(columnGroupHeaders[index])
              spannedHeader = camelCase(columnGroupHeaders[index])
            }
            //cols
            if (isEmpty(data[1][index]) || data[1][index] === 'null') data[1][index] = spannedColumn
            else {
              data[1][index] = camelCase(data[1][index])
              spannedColumn = camelCase(data[1][index])
            }
            //
            if (isEmpty(submissionData[columnGroupHeaders[index]])) submissionData[columnGroupHeaders[index]] = {}
            if (isEmpty(data[2][index]) || data[2][index] === 'null') submissionData[columnGroupHeaders[index]][data[1][index]] = ''
            else {
              if (isEmpty(submissionData[columnGroupHeaders[index]][data[1][index]])) submissionData[columnGroupHeaders[index]][data[1][index]] = [{ [camelCase(data[2][index])]: '' }]
              else {
                submissionData[columnGroupHeaders[index]][data[1][index]][0][camelCase(data[2][index])] = ''
              }
            }
          }
          //
          const rows = []
          const merges = ws['!merges'].filter(m => m.s.r > 2 && m.s.c === 0)
          //
          for (let index = 0; index < data.length; index++) {
            if (!isEmpty(data[index]) && index > 2) {
              const ind = merges.find(m => m.s.r === index)
              if (!isEmpty(ind)) {
                rows.push({ start: ind.s.r, end: ind.e.r })
                index = ind.e.r
              } else rows.push({ start: index, end: index })
            }
          }

          const intermideateData = []
          rows.forEach(row => {
            const sub = cloneDeep(submissionData)
            for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
              for (let index = row.start; index <= row.end; index++) {
                if (isNumber(data[index][colIndex])) data[index][colIndex] = `${data[index][colIndex]}`
                if (!isEmpty(data[index][colIndex])) {
                  if (isEmpty(data[2][colIndex])) sub[data[0][colIndex]][data[1][colIndex]] = data[index][colIndex]
                  else {
                    const arr = sub[data[0][colIndex]][data[1][colIndex]]
                    const key = camelCase(data[2][colIndex])
                    const arrIndex = index - row.start
                    if (isEmpty(arr[arrIndex])) arr[arrIndex] = {}
                    arr[arrIndex][key] = data[index][colIndex]
                  }
                }
              }
            }
            const selectedKeys = omit(sub, ['mappingIds', 'header', 'footer', 'nameplateInformation'])
            const selectedTests = {}
            Object.keys(selectedKeys).forEach(s => (selectedTests[s] = false))
            Object.keys(selectedKeys).forEach(q => {
              Object.keys(sub[q]).forEach(x => {
                let isChecked = false
                if (!isChecked) {
                  if (!isEmpty(sub[q][x])) {
                    isChecked = true
                    selectedTests[q] = true
                  }
                }
              })
            })
            sub['pleaseSelectTests'] = selectedTests
            //footer
            const footer = sub.footer
            if (footer.inspectionVerdict === 'Repair Needed') {
              footer.selectRepairIssues = {
                electrical: !isEmpty(footer.electricalIssueDescription),
                visual: !isEmpty(footer.visualIssueDescription),
                mechanical: !isEmpty(footer.mechanicalIssueDescription),
              }
            }
            if (footer.inspectionVerdict === 'Replacement Needed') {
              footer.selectReplacementIssues = {
                electrical: !isEmpty(footer.contactResistanceIssueDescription1),
                visual: !isEmpty(footer.generalMechanicalIssueDescription1),
                mechanical: !isEmpty(footer.insulationResistanceIssueDescription1),
              }
            }
            intermideateData.push({
              asset_form_id: sub.mappingIds.assetFormId,
              wo_inspectionsTemplateFormIOAssignment_id: sub.mappingIds.assignmentId,
              wo_id: workOrder.woId,
              asset_form_data: JSON.stringify({ data: omit(sub, ['mappingIds']) }),
            })
          })

          const wS = XLSX.utils.json_to_sheet(intermideateData)
          XLSX.utils.book_append_sheet(wB, wS, sheet)
        })

        XLSX.writeFile(wB, `${workOrder.manualWoNumber}.xlsx`)
        const file = XLSX.write(wB, { type: 'array', bookType: 'xlsx', bookVBA: true })

        AWS.config.update(bucket.config)
        const s3 = new AWS.S3()

        const zip = new JSZip()

        zip.file(`${workOrder.manualWoNumber}.xlsx`, file)

        zip.generateAsync({ type: 'blob' }).then(blob => {
          const params = { Bucket: bucket.name, Key: `${workOrder.manualWoNumber}.zip`, Body: blob, ACL: 'public-read' }
          s3.upload(params, (err, data) => {
            if (err) {
              $('#pageLoading').hide()
              throw err
            } else {
              console.log('uploaded')
              resolve({ success: true, data })
            }
          })
        })
      } else resolve({ success: false, data: 'One or more Category does exists !' })
    } catch (error) {
      console.log(error)
      reject({ success: false, data: 'Error uploading data' })
      $('#pageLoading').hide()
    }
  })
}
