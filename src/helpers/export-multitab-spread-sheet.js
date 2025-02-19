import { isEmpty } from 'lodash'
import XLSX from 'sheetjs-style'

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

export const exportMultitabSpreadSheet = ({ data, fileName }) => {
  if (!data || data.length === 0) {
    console.error('Data is undefined or empty')
    return
  }

  const wb = XLSX.utils.book_new()

  const sheetMap = data[0]

  Object.keys(sheetMap).forEach(sheetName => {
    const sheetData = sheetMap[sheetName] || []
    const ws = XLSX.utils.json_to_sheet(sheetData.length ? sheetData : [{}])

    for (let i = 0; i <= sheetData.length; i++) {
      const rowData = sheetData[i] || {}
      const keys = Object.keys(rowData)

      for (let j = 0; j < keys.length; j++) {
        const cell = mapNumberToCharacter(j + 1) + (i + 1)

        if (!isEmpty(ws[cell])) {
          ws[cell].s = i === 0 ? headerStyle : rowStyle
        }
      }
    }

    if (sheetData.length > 0) {
      const lastRowIndex = sheetData.length

      // Ensure the last row exists in the worksheet and apply rowStyle
      const lastRowKeys = Object.keys(sheetData[lastRowIndex - 1] || {})
      for (let j = 0; j < lastRowKeys.length; j++) {
        const lastCell = mapNumberToCharacter(j + 1) + (lastRowIndex + 1) // Correct row number for the last row

        if (!isEmpty(ws[lastCell])) {
          ws[lastCell].s = rowStyle
        }
      }
    }

    const maxCharacter = []
    for (let i = 0; i <= Object.keys(sheetData[0] || {}).length; i++) {
      let maxLength = 0
      for (let j = 0; j <= sheetData.length; j++) {
        const cell = mapNumberToCharacter(i + 1) + (j + 1)
        const value = !isEmpty(ws[cell]) ? String(ws[cell].v) : ''
        maxLength = Math.max(maxLength, value.length)
      }
      maxCharacter.push(maxLength)
    }

    ws['!cols'] = maxCharacter.map(width => ({ wch: width + 5 }))

    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
