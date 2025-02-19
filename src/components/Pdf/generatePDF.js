import 'jspdf-autotable'
import { jsPDF } from 'jspdf'
import { pdfjs } from 'react-pdf'
import './Manrope-Regular-normal'
import './Manrope-Medium-normal'
import { EEE_LOGO, EGALVANIC_LOGO } from '../../Constants/images'
import { getDateTime } from '../../helpers/getDateTime'
import getLogoName from '../../helpers/getLogoName'
import _ from 'lodash'
import { parseFormData } from '../../helpers/parseForm'
import { findTemplate } from './templates'
import { renderTemplate } from './utils'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
//
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function generatePDF(data) {
  // console.log(data)
  const siteName = getApplicationStorageItem('siteName')
  const company = getApplicationStorageItem('companyName')
  const clientCompany = getApplicationStorageItem('clientCompanyName')
  const { hostname } = getLogoName()
  const formData = JSON.parse(data.asset_form_data)
  const tableData = []
  const values = formData.data || {}
  const { results: formOrders, tables, tabs, grids, images } = parseFormData(formData)
  //
  const removedChildrensFromFormOrder = formOrders.filter(d => !Object.keys(tabs).includes(d))
  const parentTabs = [...new Set(Object.values(tabs))]
  //
  const modifiedFormData = {}
  Object.keys(values).forEach(key => {
    modifiedFormData[_.snakeCase(key)] = values[key]
  })
  //
  const doc = new jsPDF({ orientation: 'potrait', format: 'A4' })
  const imgData = hostname === 'eee' ? EEE_LOGO : EGALVANIC_LOGO
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()
  //
  const addFooters = doc => {
    const pageCount = doc.internal.getNumberOfPages()
    doc.setFontSize(9)
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFont('Manrope-Medium', 'normal')
      doc.setTextColor(119, 136, 153)
      doc.text('Company', 12, pageHeight - 14)
      doc.text('Client Company', 12, pageHeight - 10)
      doc.text('Site', 12, pageHeight - 6)
      doc.text('Page', pageWidth - 18, pageHeight - 6)
      doc.setTextColor(0)
      doc.setFont('Manrope-Regular', 'normal')
      doc.text(company, 29, pageHeight - 14)
      doc.text(clientCompany, 37, pageHeight - 10)
      doc.text(siteName, 20, pageHeight - 6)
      doc.text(String(i), pageWidth - 8, pageHeight - 6)
    }
  }

  if (hostname === 'eee') doc.addImage(imgData, 'JPEG', pageWidth / 2 - 22, 20, 44, 16)
  else doc.addImage(imgData, 'JPEG', pageWidth / 2 - 22, 20, 44, 20)

  doc.setFont('Manrope-Medium', 'normal')
  doc.setFontSize(14)
  doc.text(`${data.asset_form_description}`, pageWidth / 2, 45, 'center')

  const tableRows = [
    ['Work Order Number', data.wo_number, 'Work Order Type', data.workOrder.wo_type === 66 ? 'Acceptance Test WO' : 'Maintenance WO'],
    ['Inspected By', data.requested_by, 'Accepted By', data.accepted_by],
    ['Accepted At', getDateTime(data.accepted_at, data.timezone), 'Datetime Requested', getDateTime(data.created_at, data.timezone)],
  ]
  doc.autoTable({
    columns: ['', '', ' ', ' '],
    body: tableRows,
    startY: 46,
    bodyStyles: { textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineWidth: 0, lineColor: [255, 255, 255] },
    theme: 'plain',
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    didParseCell: data => {
      if (data.section === 'body' && data.column.index % 2 === 0) {
        data.cell.styles.textColor = [119, 136, 153]
      }
    },
  })

  removedChildrensFromFormOrder.forEach((key, index) => {
    let obj = modifiedFormData[key]
    const body = []
    const rowIndex = []
    const headIndex = []
    const keys = !_.isEmpty(obj) ? Object.keys(obj) : []
    const isTable = tables.filter(t => t.name === key)
    if (!['footer'].includes(key)) {
      const template = findTemplate(key)
      if (!_.isEmpty(template)) renderTemplate(template, body, obj)
      else {
        if (parentTabs.includes(key)) {
          const childs = Object.keys(tabs).filter(x => tabs[x] === key)
          childs.forEach(cd => {
            const xobj = obj[_.camelCase(cd)]
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
          //console.log(key, obj)
          const { keys, labels } = grids[key]
          body.push(labels)
          obj.dataGrid.forEach(grid => {
            const _rows = []
            keys.forEach(_key => _rows.push(grid[_key]))
            body.push(_rows)
          })
        } else if (_.isEmpty(isTable)) {
          for (var i = 0; i < keys.length; i += 2) {
            const row = []
            if (!_.isEmpty(keys[i])) {
              const key = keys[i]
              row.push(_.startCase(key))
              if (key === 'date') row.push(obj[key].split('T')[0])
              else row.push(obj[key])

              if (!_.isEmpty(keys[i + 1])) {
                const key2 = keys[i + 1]
                row.push(_.startCase(key2))
                if (key2 === 'date') row.push(obj[key2].split('T')[0])
                else row.push(obj[key2])
              }
            }
            body.push(row)
          }
        } else {
          isTable.forEach(table => {
            rowIndex.push(body.length)
            table.rows.forEach(row => {
              const _row = []
              row.forEach(col => {
                col.startsWith('#') ? _row.push(col.slice(1)) : !_.isEmpty(col) ? _row.push(obj[col]) : _row.push('')
              })
              body.push(_row)
            })
          })
        }
      }
      //
      if (!_.isEmpty(body)) {
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 8,
          tableLineWidth: 0.2,
          tableLineColor: [206, 212, 218],
          body,
          head: [
            [
              {
                content: _.upperCase(key),
                colSpan: body[0].length,
                styles: {
                  halign: 'left',
                  lineColor: [206, 212, 218],
                  border: { top: 0, right: 0, bottom: 0.2, left: 0 },
                  lineWidth: 0.2,
                  cellPadding: { top: 2, right: 0, bottom: 2, left: 2 },
                  fillColor: [247, 247, 247],
                  font: 'Manrope-Medium',
                },
              },
            ],
          ],
          bodyStyles: { cellPadding: { top: 2, right: 0, bottom: 2, left: 2 }, border: { top: 0.5, right: 0, bottom: 0, left: 0 }, lineWidth: 0.2, textColor: [12, 12, 12], fillColor: [255, 255, 255], fontSize: 9, font: 'Manrope-Regular', lineColor: [206, 212, 218] },
          columnStyles: !_.isEmpty(template) && !_.isEmpty(template.columnStyles) ? template.columnStyles : {},
          theme: 'plain',
          pageBreak: 'avoid',
          rowPageBreak: 'avoid',
          didParseCell: data => {
            if (!_.isEmpty(template)) template.style(data)
            else if (Object.keys(grids).includes(key)) {
              if (data.section === 'body' && data.row.index === 0) {
                data.cell.styles.fillColor = [206, 212, 218]
              }
            } else if (parentTabs.includes(key)) {
              if ((data.section === 'body' && data.column.index === 0) || (data.section === 'body' && rowIndex.includes(data.row.index))) {
                data.cell.styles.fillColor = [206, 212, 218]
              }
              if (data.section === 'body' && headIndex.includes(data.row.index)) {
                data.cell.styles.fillColor = [255, 255, 255]
              }
            } else if (_.isEmpty(isTable)) {
              if (data.section === 'body' && [0, 2].includes(data.column.index)) {
                data.cell.styles.textColor = [119, 136, 153]
              }
            } else {
              if ((data.section === 'body' && data.column.index === 0) || (data.section === 'body' && rowIndex.includes(data.row.index))) {
                data.cell.styles.fillColor = [206, 212, 218]
              }
            }
          },
          didDrawCell: data => {
            if (!_.isEmpty(template) && template.hasOwnProperty('draw')) {
              template.draw(data, doc, images[key], obj)
            }
          },
        })
      }
    }
  })
  if (removedChildrensFromFormOrder.includes('footer')) {
    const comments = modifiedFormData['footer']
    doc.setFontSize(9)
    doc.setFont('Manrope-Medium', 'normal')
    doc.setTextColor(119, 136, 153)
    if (!_.isEmpty(comments.testEquipment)) {
      doc.text('Test Equipment #', 14, doc.lastAutoTable.finalY + 8)
      doc.setTextColor(0)
      doc.text(comments.testEquipment, 44, doc.lastAutoTable.finalY + 8)
    }
    doc.text('Comments', 14, doc.lastAutoTable.finalY + 14)
    doc.setTextColor(0)
    doc.setFont('Manrope-Regular', 'normal')
    doc.text(comments.comments, 34, doc.lastAutoTable.finalY + 14)
  }

  addFooters(doc)

  window.open(doc.output('bloburl'))
}

export default generatePDF
