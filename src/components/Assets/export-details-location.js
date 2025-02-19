import XLSX from 'sheetjs-style'

import { Toast } from 'Snackbar/useToast'
import { isEmpty } from 'lodash'
import { conditionOptions, criticalityOptions } from 'components/WorkOrders/onboarding/utils'

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
const rowStyle = {
  font: { name: 'Trebuchet MS', sz: 10 },
}

export const exportDetailsLocation = async data => {
  if (isEmpty(data)) return Toast.error('No data found to export !')
  try {
    const sheetName = `Asset Details Location`
    const wb = XLSX.utils.book_new()
    const rows = [['Name', 'Building', 'Floor', 'Room', 'Section', 'QR Code', 'Criticality', 'Operating Conditions', 'Asset Class Code', 'Asset Class Name', 'PM Plan', 'Asset URL']]

    data.list.forEach(q => {
      const conditionOption = conditionOptions.find(d => d.value === q.conditionIndexType)
      const condition = isEmpty(conditionOption) ? '' : conditionOption.label

      const criticalityOption = criticalityOptions.find(d => d.value === q.criticalityIndexType)
      const criticality = isEmpty(criticalityOption) ? '' : criticalityOption.label

      rows.push([q.name, q.formioBuildingName, q.formioFloorName, q.formioRoomName, q.formioSectionName, q.qRCode, criticality, condition, q.assetClassCode, q.assetClassName, q.pmPlanName, q.assetDetailsUrl])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows, { skipHeader: true })
    let startIndex = 0
    rows[0].forEach(d => {
      const cell = mapNumberToCharacter(startIndex + 1) + `1`
      ws[cell].s = headerStyle
      startIndex += 1
    })

    rows.slice(1).forEach((row, index) => {
      row.forEach((d, i) => {
        const cell = mapNumberToCharacter(i + 1) + `${index + 2}`
        if (!isEmpty(ws[cell])) {
          ws[cell].s = row.length - 1 === i ? { font: { ...rowStyle.font, color: { rgb: '1A0DAB' }, underline: true } } : rowStyle
          if (row.length - 1 === i) ws[cell].l = { Target: d, Tooltip: `open ${rows[0]}` }
        }
      })
    })

    ws['!cols'] = [{ wch: 64 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 85 }]
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `asset-details-by-location.xlsx`)
  } catch (error) {
    console.log(error)
    Toast.error('Error exporting data. Please try again !')
  }
}
