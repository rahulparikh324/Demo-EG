import XLSX from 'sheetjs-style'

import { Toast } from 'Snackbar/useToast'
import { isEmpty } from 'lodash'

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

export const exportClassData = async data => {
  if (isEmpty(data)) return Toast.error('No data found to export !')
  try {
    const sheetName = `Asset Class Count`
    const wb = XLSX.utils.book_new()
    const rows = [['Asset Class Name', 'Asset Class Code', '1', '2', '3']]
    data.forEach(q => {
      rows.push([q.assetClassName, q.assetClassCode, q.condition1AssetCount, q.condition2AssetCount, q.condition3AssetCount])
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
        ws[cell].s = rowStyle
      })
    })
    ws['!cols'] = [{ wch: 64 }, { wch: 64 }, { wch: 10 }, { wch: 10 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `asset-count-by-class-condition.xlsx`)
  } catch (error) {
    Toast.error('Error exporting data. Please try again !')
  }
}
