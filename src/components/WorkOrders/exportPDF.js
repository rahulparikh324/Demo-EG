import exportWorkOrderPDF from '../../Services/WorkOrder/exportWorkOrderPDF'
import { Toast } from '../../Snackbar/useToast'
import $ from 'jquery'
import _ from 'lodash'
import 'jspdf-autotable'
import { jsPDF } from 'jspdf'
import { pdfjs } from 'react-pdf'
import '../Pdf/Manrope-Regular-normal'
import '../Pdf/Manrope-Medium-normal'
import { parseFormData, getFormName } from '../../helpers/parseForm'
import { getFormatedDate } from 'helpers/getDateTime'
import { findTemplate } from '../Pdf/templates'
import { renderTemplate, checkForExistingForm, isComplexForm, selectedTests } from 'components/Pdf/utils'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
//
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

let bulkPdfRecords = []

export const BulkPdfGenrator = async () => {
  const FileNameMap = new Map()
  try {
    const genrateZip = () => {
      var zip = new JSZip()
      bulkPdfRecords.forEach(row => {
        const blob = row.blob
        const specialCharsRegex = /[\/\\:*?"<>|&%]/g
        // Replace special characters with underscores
        const fileName = row.pdfName.replace(specialCharsRegex, '_')
        if (FileNameMap.has(fileName)) {
          const count = FileNameMap.get(fileName)
          FileNameMap.set(fileName, count + 1)
          zip.file(`${fileName} (${count + 1}).pdf`, blob)
        } else {
          FileNameMap.set(fileName, 0)
          zip.file(`${fileName}.pdf`, blob)
        }
      })

      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        saveAs(blob, 'Reports.zip')
        bulkPdfRecords = []
        FileNameMap.clear()
      })
    }
    if (bulkPdfRecords.length > 0) {
      genrateZip()
      return true
    } else {
      Toast.error('Error Generating Multiple PDF')
      return false
    }
  } catch (error) {
    Toast.error('Error Generating Multiple PDF')
    console.log(error)
    return false
  }
}

async function exportPDF({ wo, woDetails, isFromSubmitted, isDefective, isForBulkPdf = false }) {
  try {
    if (!isDefective) $('#pageLoading').show()
    const { data } = isFromSubmitted ? {} : await exportWorkOrderPDF(wo.wo_id)
    const isCalibrationDateEnabled = isFromSubmitted ? wo.isCalibrationDateEnabled : data.isCalibrationDateEnabled
    const tasks = []
    if (isFromSubmitted) {
      const task = {
        task_form: { asset_form_data: wo.asset_form_data, asset_form_description: wo.asset_form_description },
        form_data: wo.asset_form_data,
        form_type: wo.form_category_name,
        form_name: wo.asset_form_name,
      }
      tasks.push(task)
    } else {
      const { master_forms: forms } = data
      data.form_category_list.forEach(category => {
        const { form_data } = forms.find(d => d.form_id === category.form_id)
        category.task_list.forEach(task => {
          tasks.push({ ...task, form_data })
        })
      })
    }
    if (_.isEmpty(tasks)) {
      Toast.error('No completed Task found to export !')
      $('#pageLoading').hide()
    } else {
      const siteName = getApplicationStorageItem('siteName')
      const company = getApplicationStorageItem('companyName')
      const clientCompany = getApplicationStorageItem('clientCompanyName')
      //
      const doc = new jsPDF({ orientation: 'potrait', format: 'A4' })
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()
      const imgData = localStorage.getItem('base64-logo')
      const aspectRatio = Number(localStorage.getItem('logo-aspect-ratio'))
      let allImagesAdded = !isDefective
      //
      const addFooters = doc => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(9)
        for (var i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFont('Manrope-Medium', 'normal')
          doc.setTextColor(119, 136, 153)
          doc.text('Company', 14, pageHeight - 14)
          doc.text('Client Company', 14, pageHeight - 10)
          doc.text('Site', 14, pageHeight - 6)
          doc.text('Page', pageWidth - 26, pageHeight - 9)
          doc.setTextColor(0)
          doc.setFont('Manrope-Regular', 'normal')
          doc.text(company, 31, pageHeight - 14)
          doc.text(clientCompany, 39, pageHeight - 10)
          doc.text(siteName, 22, pageHeight - 6)
          doc.text(String(i), pageWidth - 16, pageHeight - 9)
          if (imgData) doc.addImage(imgData, 'JPEG', pageWidth - (10 * aspectRatio + 38), pageHeight - 16, 10 * aspectRatio, 10)
          //else doc.addImage(imgData, 'JPEG', pageWidth - 40, pageHeight - 16, 17, 10)
        }
      }
      let fileName = ''
      //
      tasks.forEach((task, taskIndex) => {
        const formData = JSON.parse(task.task_form.asset_form_data)
        const form = JSON.parse(task.form_data)
        const values = formData.data || {}
        const { results: formOrders, tables, tabs, grids, images, suffixes } = parseFormData({ data: form, rootData: form })
        const formName = getFormName(form)
        //console.log(form)
        //console.log(values)
        //console.log({ formOrders, tabs, formName, images, grids, suffixes })
        const existingTemplatedForm = checkForExistingForm(formName)
        const isComplexStructuredForm = isComplexForm(formName)
        //console.log(isComplexStructuredForm)
        doc.setDrawColor(255, 0, 0)
        doc.setLineWidth(0.6)
        doc.line(14, 10, 196, 10)
        doc.line(14, 17, 196, 17)
        doc.line(14, 10, 14, 17)
        doc.line(196, 10, 196, 17)

        doc.setFont('Manrope-Medium', 'normal')
        doc.setFontSize(13)
        doc.setTextColor(0)
        doc.text(`${isDefective ? 'DEFECTIVE REPORT - ' : ''}${_.upperCase(task.task_form.asset_form_description)}`, pageWidth / 2, 15, 'center')
        //tables occurrences
        const modifiedFormData = {}
        Object.keys(values).forEach(key => {
          modifiedFormData[_.snakeCase(key)] = values[key]
        })

        //
        const removedHeaderFormOrder = () => {
          const list = !_.isEmpty(isComplexStructuredForm) ? isComplexStructuredForm.map(struct => struct.name) : !_.isEmpty(existingTemplatedForm) ? existingTemplatedForm : formOrders.filter(d => !Object.keys(tabs).includes(d))
          let newList = list.slice(1)
          const testKey = _.findKey(modifiedFormData, 'pleaseSelectTests')
          const testData = !_.isEmpty(testKey) ? _.get(modifiedFormData, `${testKey}.pleaseSelectTests`, {}) : _.get(modifiedFormData, `please_select_tests`, {})
          if (!_.isEmpty(testData)) {
            const removedSection = []
            //const updatedTestData = selectedTests(formName, testData)
            Object.keys(testData).forEach(key => !testData[key] && removedSection.push(_.snakeCase(key)))
            newList = newList.filter(d => !removedSection.includes(d.split('$')[0]))
          }
          if (isDefective) newList = newList.filter(d => ['footer', 'nameplate_information'].includes(d))
          return newList
        }
        const removedChildrensFromFormOrder = removedHeaderFormOrder()

        const parentTabs = !_.isEmpty(existingTemplatedForm) ? [] : [...new Set(Object.values(tabs))]
        const formatHeaderData = data => {
          const d = { ...data }
          Object.keys(d).forEach(k => {
            d[k] = _.isEmpty(d[k]) ? '' : d[k]
          })
          return d
        }
        const headerData = formatHeaderData(modifiedFormData.header)
        // let fileName = ''
        if (!_.isEmpty(headerData.location) || !_.isEmpty(headerData.parent)) fileName += headerData.location || headerData.parent
        if (!_.isEmpty(headerData.identification)) fileName += `_${headerData.identification}`
        if (!_.isEmpty(task.form_name)) fileName += `_${task.form_name}`

        const left = 14
        const left2 = 128
        const topOffset = 36
        doc.setFontSize(10)
        doc.setFont('Manrope-Medium', 'normal')
        doc.setTextColor(119, 136, 153)
        doc.text('Location:', left, 24)
        doc.text('Identification:', left, 28)
        doc.setTextColor(0)
        doc.text(_.get(headerData, 'parent', '') || '', left + Math.ceil(doc.getTextWidth('Location:')) + 1, 24)
        doc.text(_.get(headerData, 'identification', '') || '', left + Math.ceil(doc.getTextWidth('Identification:')) + 1, 28)

        doc.setFontSize(9)
        doc.setTextColor(119, 136, 153)
        doc.text('Customer:', left, topOffset)
        doc.text('Customer Address:', left, topOffset + 4)
        doc.text('Owner:', left, topOffset + 8)
        doc.text('Owner Address:', left, topOffset + 12)
        doc.text('Asset ID:', left, topOffset + 16)
        doc.text('Floor:', left, topOffset + 20)
        doc.text('Section:', left, topOffset + 24)

        doc.text('Date:', left2, topOffset)
        doc.text('Work Order:', left2, topOffset + 4)
        doc.text('Temperature:', left2, topOffset + 8)
        doc.text('Humidity:', left2, topOffset + 12)
        doc.text('Building:', left2, topOffset + 16)
        doc.text('Room:', left2, topOffset + 20)
        doc.setTextColor(0)

        doc.text(_.get(headerData, 'customer', '') || '', left + Math.ceil(doc.getTextWidth('Customer:')) + 1, topOffset)
        doc.text(_.get(headerData, 'customerAddress', '') || '', left + Math.ceil(doc.getTextWidth('Customer Address:')) + 1, topOffset + 4)
        doc.text(_.get(headerData, 'owner', '') || '' || '', left + Math.ceil(doc.getTextWidth('Owner:')) + 1, topOffset + 8)
        doc.text(_.get(headerData, 'ownerAddress', '') || '' || '', left + Math.ceil(doc.getTextWidth('Owner Address:')) + 1, topOffset + 12)
        doc.text(_.get(headerData, 'assetId', '') || '', left + Math.ceil(doc.getTextWidth('Asset ID:')) + 1, topOffset + 16)
        doc.text(`${_.get(headerData, 'floor', '') || '' || ''}`, left + Math.ceil(doc.getTextWidth('Floor:')) + 1, topOffset + 20)
        doc.text(`${_.get(headerData, 'section', '') || '' || ''}`, left + Math.ceil(doc.getTextWidth('Section:')) + 1, topOffset + 24)

        doc.text(_.get(headerData, 'date', '').split('T')[0], left2 + Math.ceil(doc.getTextWidth('Date:')) + 1, topOffset)
        doc.text(_.get(headerData, 'workOrder', ''), left2 + Math.ceil(doc.getTextWidth('Work Order:')) + 1, topOffset + 4)
        doc.text(_.isEmpty(_.get(headerData, 'temperature', '')) ? '' : `${_.get(headerData, 'temperature', '')} °C`, left2 + Math.ceil(doc.getTextWidth('Temperature:')) + 1, topOffset + 8)
        doc.text(_.isEmpty(_.get(headerData, 'humidity', '')) ? '' : `${_.get(headerData, 'humidity', '')} %`, left2 + Math.ceil(doc.getTextWidth('Humidity:')) + 1, topOffset + 12)
        doc.text(`${_.get(headerData, 'building', '')}`, left2 + Math.ceil(doc.getTextWidth('Building:')) + 1, topOffset + 16)
        doc.text(`${_.get(headerData, 'room', '')}`, left2 + Math.ceil(doc.getTextWidth('Room:')) + 1, topOffset + 20)

        removedChildrensFromFormOrder.forEach((key, index) => {
          const complexObj = isComplexStructuredForm.find(d => d.name === key)
          let obj = !_.isEmpty(complexObj) && !_.isEmpty(complexObj.obj) ? modifiedFormData[_.snakeCase(complexObj.obj)] : modifiedFormData[key.split('$')[0]]
          if (!_.isEmpty(complexObj) && complexObj.hasOwnProperty('process')) obj = complexObj.process(obj)
          //console.log(key, obj)
          const body = []
          const rowIndex = []
          const headIndex = []
          const keys = !_.isEmpty(obj) ? Object.keys(obj) : []
          const isTable = !_.isEmpty(complexObj) && !_.isEmpty(complexObj.obj) ? tables.filter(t => t.name === complexObj.obj) : tables.filter(t => t.name === key)
          let hasNote = false
          let hasNoteIndex = 0
          if (!['footer'].includes(key) && !_.isEmpty(obj)) {
            const template = findTemplate(key)
            if (!_.isEmpty(template)) renderTemplate(template, body, obj, suffixes, key)
            else {
              if (parentTabs.includes(key) && _.isEmpty(obj)) {
                const childs = Object.keys(tabs).filter(x => tabs[x] === key)
                childs.forEach(cd => {
                  const xobj = obj[_.camelCase(cd)] ? obj[_.camelCase(cd)] : obj[cd] ? obj[cd] : obj[key]
                  const isTable = tables.find(t => t.name === cd)
                  headIndex.push(body.length)
                  const endHead = new Array(isTable.numCols - 1).fill('')
                  body.push([_.startCase(cd), ...endHead])
                  rowIndex.push(body.length)
                  isTable.rows.forEach(row => {
                    const _row = []
                    row.forEach(col => {
                      col.startsWith('#') ? _row.push(col.slice(1)) : !_.isEmpty(col) ? _row.push(xobj[col]) : _row.push('')
                    })
                    body.push(_row)
                  })
                })
              } else if (Object.keys(grids).includes(key)) {
                const { keys, labels, name } = grids[key]
                if (!_.isEmpty(obj)) {
                  const dataGrid = !_.isEmpty(obj[name]) ? obj[name] : []
                  body.push(labels)
                  dataGrid.forEach(grid => {
                    const _rows = []
                    keys.forEach(_key => _rows.push(grid[_key]))
                    body.push(_rows)
                  })
                }
              } else if (_.isEmpty(isTable)) {
                for (var i = 0; i < keys.length; i += 2) {
                  const row = []
                  if (!_.isEmpty(keys[i])) {
                    const key = keys[i]
                    row.push(_.startCase(key))
                    if (key === 'date') row.push(obj[key].split('T')[0])
                    else if (!_.isEmpty(suffixes[key]) && !_.isEmpty(obj[key])) row.push(`${obj[key]} ${suffixes[key]}`)
                    else row.push(obj[key])

                    if (!_.isEmpty(keys[i + 1])) {
                      const key2 = keys[i + 1]
                      row.push(_.startCase(key2))
                      if (key2 === 'date') row.push(obj[key2].split('T')[0])
                      else if (!_.isEmpty(suffixes[key2]) && !_.isEmpty(obj[key2])) row.push(`${obj[key2]} ${suffixes[key2]}`)
                      else row.push(obj[key2])
                    }
                  }
                  if (row.includes('Note') && key === 'visual_inspection') {
                    const ind = row.indexOf('Note')
                    if (ind === 2) {
                      hasNote = true
                      body.push([row[0], row[1], '', ''])
                      body.push([row[3], '', '', ''])
                      hasNoteIndex = body.length - 1
                    } else {
                      body.push([row[1], '', '', ''])
                      hasNote = true
                      hasNoteIndex = body.length - 1
                    }
                  } else body.push(row)
                }
              } else {
                isTable.forEach(table => {
                  table.rows.forEach(row => {
                    const _row = []
                    row.forEach(col => {
                      col.startsWith('#') ? _row.push(col.slice(1)) : !_.isEmpty(col) ? (!_.isEmpty(suffixes[col]) && !_.isEmpty(obj[col]) ? _row.push(`${obj[col]} ${suffixes[col]}`) : _row.push(obj[col])) : _row.push('')
                    })
                    body.push(_row)
                  })
                })
              }
            }
            if (!_.isEmpty(body)) {
              doc.autoTable({
                startY: index === 0 ? 64 : doc.lastAutoTable === false ? 64 * index + 8 : doc.lastAutoTable.finalY + 8,
                tableLineWidth: 0.2,
                tableLineColor: [206, 212, 218],
                body,
                head: [
                  [
                    {
                      content: _.upperCase(key.split('$')[0]),
                      colSpan: body[0].length,
                      styles: {
                        halign: 'left',
                        lineColor: [206, 212, 218],
                        border: { top: 0, right: 0, bottom: 0.2, left: 0 },
                        lineWidth: 0.2,
                        cellPadding: { top: 2, right: 0, bottom: 2, left: 2 },
                        fillColor: [247, 247, 247],
                        font: 'Manrope-Medium',
                        textColor: [119, 136, 153],
                      },
                    },
                  ],
                ],
                bodyStyles: { cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }, border: { top: 0.5, right: 0, bottom: 0, left: 0 }, lineWidth: 0.2, textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineColor: [206, 212, 218] },
                columnStyles: !_.isEmpty(template) && !_.isEmpty(template.columnStyles) ? template.columnStyles : {},
                theme: 'plain',
                pageBreak: 'avoid',
                rowPageBreak: 'avoid',
                didParseCell: data => {
                  if (!_.isEmpty(template)) template.style(data, template)
                  else if (hasNote) {
                    if (data.section === 'body' && data.row.index === hasNoteIndex) {
                      data.cell.styles.textColor = [0, 0, 0]
                      data.cell.colSpan = 4
                    }
                  } else if (Object.keys(grids).includes(key)) {
                    if (data.section === 'body' && data.row.index === 0) {
                      //data.cell.styles.fillColor = [206, 212, 218]
                    }
                  } else if (parentTabs.includes(key)) {
                    if ((data.section === 'body' && data.column.index === 0) || (data.section === 'body' && rowIndex.includes(data.row.index))) {
                      data.cell.styles.fillColor = [206, 212, 218]
                    }
                    if (data.section === 'body' && headIndex.includes(data.row.index)) {
                      //data.cell.styles.fillColor = [255, 255, 255]
                    }
                  } else if (_.isEmpty(isTable)) {
                    if (data.section === 'body' && [0, 2].includes(data.column.index)) {
                      data.cell.styles.textColor = [119, 136, 153]
                    }
                  }
                },
                didDrawCell: data => {
                  if (!_.isEmpty(template) && template.hasOwnProperty('draw')) {
                    if (!_.isEmpty(complexObj) && !_.isEmpty(complexObj.obj)) template.draw(data, doc, { ...images[key], ...images[complexObj.obj] }, obj)
                    else template.draw(data, doc, images[key], obj)
                  }
                },
              })
            }
          }
        })
        if (removedChildrensFromFormOrder.includes('footer')) {
          let yPOS = doc.lastAutoTable.finalY + 8

          const body = []
          let calibrationTableRowIndex = 0
          const calibrationTableBody = []

          const comments = modifiedFormData['footer']
          doc.setFontSize(9)
          doc.setFont('Manrope-Medium', 'normal')
          doc.setTextColor(119, 136, 153)

          const commentsArray = doc.splitTextToSize(comments.comments, 170)
          if (isDefective) {
            const defectDescription = _.get(comments, 'defectDescription', '')
            const defectsArray = doc.splitTextToSize(defectDescription, 150)
            doc.setTextColor(119, 136, 153)
            doc.text('Defect Description', 14, yPOS)
            doc.setTextColor(0)
            doc.text(defectsArray, 44, yPOS)
            yPOS += 4 * defectsArray.length
          }
          if (!isDefective && !_.isEmpty(comments.inspectionVerdict)) body.push(['Inspection Verdict', comments.inspectionVerdict, '', ''])
          if (!isDefective && !_.isEmpty(comments.infraredScanVerdict)) body.push(['Inspection Verdict', comments.infraredScanVerdict, '', ''])
          //repair
          if (!isDefective && !_.isEmpty(comments.repairSchedule)) {
            const repair = { today: 'I will repair today', future: 'A future repair should be scheduled' }
            body.push(['Repair Timing', repair[comments.repairSchedule], '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.visualIssueDescription)) {
            const description = _.get(comments, 'visualIssueDescription', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Visual Issue Description', descriptionArray, '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.mechanicalIssueDescription)) {
            const description = _.get(comments, 'mechanicalIssueDescription', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Mechanical Issue Description', descriptionArray, '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.electricalIssueDescription)) {
            const description = _.get(comments, 'electricalIssueDescription', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Electrical Issue Description', descriptionArray, '', ''])
          }
          //replacement
          if (!isDefective && !_.isEmpty(comments.replacementSchedule)) {
            const repair = { today: 'I will replace today', future: 'A future replacement should be scheduled' }
            body.push(['Replace Timing', repair[comments.replacementSchedule], '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.generalMechanicalIssueDescription1)) {
            const description = _.get(comments, 'generalMechanicalIssueDescription1', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Visual Issue Description', descriptionArray, '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.insulationResistanceIssueDescription1)) {
            const description = _.get(comments, 'insulationResistanceIssueDescription1', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Mechanical Issue Description', descriptionArray, '', ''])
          }
          if (!isDefective && !_.isEmpty(comments.contactResistanceIssueDescription1)) {
            const description = _.get(comments, 'contactResistanceIssueDescription1', '')
            const descriptionArray = doc.splitTextToSize(description, 140)
            body.push(['Electrical Issue Description', descriptionArray, '', ''])
          }
          //general comments
          if (!isDefective) body.push(['General Comments', commentsArray, '', ''])
          // violations
          if (!isDefective && comments.violations === 'yes') {
            if (!_.isEmpty(comments.necViolations)) {
              let arr = ''
              comments.necViolations.forEach((d, i) => {
                arr += `${d.selectViolation}${i < comments.necViolations.length - 1 ? `\n` : ''}`
              })
              body.push(['NEC Violation(s)', arr, '', ''])
            }
          }
          if (!isDefective && comments.violations === 'yes') {
            if (!_.isEmpty(comments.oshaViolations)) {
              let arr = ''
              comments.oshaViolations.forEach((d, i) => {
                arr += `${d.selectViolation}${i < comments.oshaViolations.length - 1 ? '\n' : ''}`
              })
              body.push(['OSHA Violation(s)', arr, '', ''])
            }
          }
          if (!isDefective && !_.isEmpty(comments.testEquipmentNumber)) body.push(['Test Equipment Number', comments.testEquipmentNumber, '', ''])
          if (!isDefective && !_.isEmpty(comments.testedBy)) body.push(['Tested By', comments.testedBy, '', ''])
          // calibration table
          if (!isDefective && !_.isEmpty(comments.testEquipmentCalibrationTable)) {
            calibrationTableRowIndex = body.length
            body.push(['', '', '', ''], ['', '', '', ''], ['', '', '', ''])
            calibrationTableBody.push(['Equipment ID', 'Name', 'Serial Number', `${isCalibrationDateEnabled ? 'Calibration Date' : ''}`])
            comments.testEquipmentCalibrationTable.forEach(d => {
              body.push(['', '', '', ''])
              const date = getFormatedDate(_.get(d, 'calibrationDate', '').split('T')[0])
              calibrationTableBody.push([d.equipmentNumber, d.name, d.serialNumber, date])
            })
          }
          //defective
          if (isDefective) {
            const defectPhotos = _.get(comments, 'defectPhotos', [])
            const addPhotos = async () => {
              doc.setTextColor(119, 136, 153)
              doc.text('Uploaded Photos', 14, yPOS)
              doc.setTextColor(0)
              yPOS += 4
              let xPOS = 14
              defectPhotos.forEach((d, i) => {
                const img = new Image()
                img.src = d.url
                img.onload = () => {
                  const aspectRatio = img.width / img.height
                  const height = 35
                  const width = height * aspectRatio
                  doc.addImage(d.url, 'PNG', xPOS, yPOS, width, height)
                  xPOS += width + 6
                  if (xPOS >= pageWidth - width - 14) {
                    xPOS = 14
                    yPOS = 20
                    doc.addPage()
                  }
                  if (i === defectPhotos.length - 1) allImagesAdded = true
                }
              })
            }
            if (!_.isEmpty(defectPhotos)) {
              ;(async () => {
                await addPhotos()
              })()
            } else allImagesAdded = true
          }

          if (!isDefective) {
            doc.autoTable({
              startY: yPOS,
              tableLineWidth: 0.2,
              tableLineColor: [206, 212, 218],
              body,
              head: [
                [
                  {
                    content: 'RESULTS',
                    colSpan: body[0].length,
                    styles: { halign: 'left', textColor: [119, 136, 153], lineColor: [206, 212, 218], border: { top: 0, right: 0, bottom: 0.2, left: 0 }, lineWidth: 0.2, cellPadding: { top: 2, right: 0, bottom: 2, left: 2 }, fillColor: [247, 247, 247], font: 'Manrope-Medium' },
                  },
                ],
              ],
              bodyStyles: { cellPadding: { top: 2, right: 0, bottom: 2, left: 2 }, border: { top: 0.5, right: 0, bottom: 0, left: 0 }, lineWidth: 0.2, textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineColor: [206, 212, 218] },
              columnStyles: { 0: { cellWidth: 48 } },
              cellStyles: { 1: { valign: 'top' } },
              theme: 'plain',
              pageBreak: 'avoid',
              rowPageBreak: 'avoid',
              didParseCell: data => {
                if (data.section === 'body' && [0].includes(data.column.index)) data.cell.styles.textColor = [119, 136, 153]
                if (data.section === 'body' && data.column.index === 1) {
                  if (data.row.index < calibrationTableRowIndex || calibrationTableRowIndex === 0) data.cell.colSpan = 3
                }
                if (data.section === 'body' && !_.isEmpty(comments.testEquipmentCalibrationTable) && data.column.index === 0 && data.row.index === calibrationTableRowIndex) {
                  data.cell.rowSpan = body.length - calibrationTableRowIndex
                  data.cell.colSpan = 4
                }
              },
              didDrawCell: data => {
                if (data.section === 'body' && !_.isEmpty(comments.testEquipmentCalibrationTable) && data.column.index === 0 && data.row.index === calibrationTableRowIndex) {
                  doc.autoTable({
                    startY: data.cell.y + 2,
                    margin: { left: data.cell.x + 2 },
                    tableWidth: data.cell.width - 4,
                    tableLineWidth: 0.2,
                    tableLineColor: [206, 212, 218],
                    body: calibrationTableBody,
                    head: [
                      [
                        {
                          content: 'Test Equipment Calibration Table',
                          colSpan: body[0].length,
                          styles: { halign: 'left', textColor: [119, 136, 153], lineColor: [206, 212, 218], border: { top: 0, right: 0, bottom: 0.2, left: 0 }, lineWidth: 0.2, cellPadding: { top: 2, right: 0, bottom: 2, left: 2 }, fillColor: [247, 247, 247], font: 'Manrope-Medium' },
                        },
                      ],
                    ],
                    bodyStyles: { cellPadding: { top: 1.5, right: 0, bottom: 1.5, left: 2 }, border: { top: 0.5, right: 0, bottom: 0, left: 0 }, lineWidth: 0.2, textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineColor: [206, 212, 218] },
                    columnStyles: { 0: { cellWidth: 48 } },
                    cellStyles: { 1: { valign: 'top' } },
                    theme: 'plain',
                    pageBreak: 'avoid',
                    rowPageBreak: 'avoid',
                    didParseCell: data => {
                      if (data.section === 'body' && [0].includes(data.row.index)) data.cell.styles.textColor = [119, 136, 153]
                      if (data.section === 'body' && data.column.index === 2) {
                        if (!isCalibrationDateEnabled) data.cell.colSpan = 2
                      }
                    },
                  })
                }
              },
            })
          }
        }
        if (taskIndex < tasks.length - 1) doc.addPage()
        if (taskIndex > 0) fileName = wo.manual_wo_number

        doc.setProperties({ title: fileName })
        localStorage.setItem('pdfName', fileName)
      })
      const generateAndOpenPDF = async () => {
        addFooters(doc)
        if (isForBulkPdf) {
          bulkPdfRecords.push({ blob: doc.output('blob'), pdfName: fileName })
        } else {
          window.open(`../../engineering-letter`, '_blank')
          localStorage.setItem('pdfURL', doc.output('bloburl'))
        }
        $('#pageLoading').hide()
      }
      const checkImagesLoaded = () => {
        // if (!allImagesAdded) setTimeout(() => checkImagesLoaded(), 500)
        // else
        generateAndOpenPDF()
      }
      checkImagesLoaded()
    }
  } catch (error) {
    console.log(error)
    if (!isForBulkPdf) Toast.error('Error Generating PDF')
    $('#pageLoading').hide()
    if (isForBulkPdf) throw 'Error Generating PDF'
  }
}

export default exportPDF
