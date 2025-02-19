import { camelizeKeys } from 'helpers/formatters'
import { Toast } from 'Snackbar/useToast'

import 'components/Pdf/Manrope-Regular-normal'
import 'components/Pdf/Manrope-Medium-normal'

import { renderTable, renderHeader } from 'components/Assets/AssetDetail/circuits/helpers'

import 'jspdf-autotable'
import { jsPDF } from 'jspdf'
import { pdfjs } from 'react-pdf'
import { get, isEmpty, startCase } from 'lodash'
//
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
//
const generateReport = async (data, list, feeding) => {
  const details = camelizeKeys(data)
  console.log(feeding)
  const doc = new jsPDF({ orientation: 'potrait', format: 'A4' })
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight()
  try {
    doc.setDrawColor(255, 0, 0)
    doc.setLineWidth(0.6)
    doc.line(14, 10, 196, 10)
    doc.line(14, 17, 196, 17)
    doc.line(14, 10, 14, 17)
    doc.line(196, 10, 196, 17)

    doc.setFont('Manrope-Medium', 'normal')
    doc.setFontSize(13)
    doc.setTextColor(0)
    doc.text(`CIRCUIT REPORT`, pageWidth / 2, 15, 'center')

    const left = 14
    const left2 = 128
    const topOffset = 36
    doc.setFontSize(10)
    doc.setFont('Manrope-Medium', 'normal')
    doc.setTextColor(119, 136, 153)
    doc.text('Asset :', left, 24)
    doc.text('Asset Class :', left, 29)
    doc.setTextColor(0)
    doc.text(get(details, 'name', '') || '', left + Math.ceil(doc.getTextWidth('Asset :')) + 1, 24)
    doc.text(get(details, 'assetClassName', '') || '', left + Math.ceil(doc.getTextWidth('Asset Class :')) + 1, 29)
    doc.setFontSize(9)
    //nameplate info
    const nameplateInfoBody = []
    if (!isEmpty(get(details, 'formRetrivedNameplateInfo', ''))) {
      const info = JSON.parse(details.formRetrivedNameplateInfo)
      const keys = Object.keys(info)
      for (let i = 0; i < keys.length; i += 2) {
        const row = []
        if (!isEmpty(keys[i])) {
          row.push(startCase(keys[i]))
          row.push(info[keys[i]])
        }
        if (!isEmpty(keys[i + 1])) {
          row.push(startCase(keys[i + 1]))
          row.push(info[keys[i + 1]])
        }
        nameplateInfoBody.push(row)
      }
      if (!isEmpty(nameplateInfoBody)) renderTable({ doc, startY: 34, body: nameplateInfoBody, header: 'NAMEPLATE INFORMATION' })
    }
    //location
    if (!isEmpty(get(details, 'assetLocationHierarchy', ''))) {
      const locationInfoBody = []
      const info = details.assetLocationHierarchy
      locationInfoBody.push(['Building', info.formioBuildingName || '', 'Floor', info.formioFloorName || ''])
      locationInfoBody.push(['Room', info.formioRoomName || '', 'Section', info.formioSectionName || ''])
      const startY = doc.lastAutoTable === false ? 34 : doc.lastAutoTable.finalY + 6
      if (!isEmpty(locationInfoBody)) renderTable({ doc, startY, body: locationInfoBody, header: 'LOCATION' })
    }
    //fed by
    let startFeedingY = doc.lastAutoTable === false ? 34 : doc.lastAutoTable.finalY + 6

    if (!isEmpty(get(list, 'fedbyAssetList', []))) {
      const normalFedBy = get(list, 'fedbyAssetList', []).filter(d => d.fedByUsageTypeId === 1)
      const emergencyFedBy = get(list, 'fedbyAssetList', []).filter(d => d.fedByUsageTypeId === 2)

      let startY = doc.lastAutoTable === false ? 34 : doc.lastAutoTable.finalY + 6

      renderHeader({ doc, left, startY, pageWidth, title: 'FED-BYs' })
      startY += 14

      if (!isEmpty(normalFedBy)) {
        doc.setTextColor(119, 136, 153)
        doc.text('NORMAL', left, startY)
        startY += 6
        doc.setTextColor(0)
        normalFedBy.forEach(d => {
          doc.text(`- ${d.parentAssetName}`, left + 4, startY)
          startY += 6
        })
      }
      if (!isEmpty(emergencyFedBy)) {
        doc.setTextColor(119, 136, 153)
        doc.text('EMERGENCY', left, startY)
        startY += 6
        doc.setTextColor(0)
        emergencyFedBy.forEach(d => {
          doc.text(`- ${d.parentAssetName}`, left + 4, startY)
          startY += 6
        })
      }
      startFeedingY = startY
    }
    // feeding
    if (!isEmpty(feeding)) {
      let startY = startFeedingY + 6
      renderHeader({ doc, left, startY, pageWidth, title: 'FEEDING' })
      startY += 14
      doc.setTextColor(0)

      const drawFeeding = (asset, level) => {
        if (startY >= pageHeight - 14) {
          startY = 14
          doc.addPage()
        }
        doc.text(`${asset.feedingAssetName}`, left + level * 8, startY)
        doc.line(left + (level - 1) * 8 + 2, startY - 1, left + level * 8 - 2, startY - 1)
        startY += 6
        if (!isEmpty(get(asset, 'children', []))) {
          get(asset, 'children', []).forEach(d => {
            drawFeeding(d, level + 1)
          })
        }
      }

      const normalFeeding = feeding.filter(d => d.fedByUsageTypeId === 1)
      const emergencyFeeding = feeding.filter(d => d.fedByUsageTypeId === 2)

      if (!isEmpty(normalFeeding)) {
        doc.setTextColor(119, 136, 153)
        doc.text('NORMAL', left, startY)
        startY += 6
        doc.setTextColor(0)
        normalFeeding.forEach(d => {
          drawFeeding(d, 1)
        })
      }
      //
      if (!isEmpty(emergencyFeeding)) {
        doc.setTextColor(119, 136, 153)
        doc.text('EMERGENCY', left, startY)
        startY += 6
        doc.setTextColor(0)
        emergencyFeeding.forEach(d => {
          drawFeeding(d, 1)
        })
      }
    }

    const fileName = `${details.name}-Circuit-Report`
    doc.setProperties({ title: fileName })
    localStorage.setItem('pdfName', fileName)
    window.open(`../../engineering-letter`, '_blank')
    localStorage.setItem('pdfURL', doc.output('bloburl'))
  } catch (error) {
    console.log(error)
  }
}

export default generateReport
