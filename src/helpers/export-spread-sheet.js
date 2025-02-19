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

export const exportSpreadSheet = ({ data, fileName }) => {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  if (!data || data.length === 0) {
    console.error('Data is undefined or empty')
    return
  }

  for (let i = 0; i < data.length; i++) {
    if (!data[i] || typeof data[i] !== 'object') {
      console.error(`Invalid data entry at index ${i}`)
      continue
    }

    const keys = Object.keys(data[i])

    for (let j = 0; j < keys.length; j++) {
      const cell = mapNumberToCharacter(j + 1) + (i + 1)
      if (!isEmpty(ws[cell])) {
        ws[cell].s = i === 0 ? headerStyle : rowStyle
      }
    }
  }

  const maxCharacter = []
  for (let i = 0; i <= Object.keys(data[0]).length; i++) {
    let maxLength = 0
    for (let j = 0; j <= data.length; j++) {
      const cell = mapNumberToCharacter(i + 1) + (j + 1)
      const value = !isEmpty(ws[cell]) ? String(ws[cell].v) : ''
      maxLength = Math.max(maxLength, value.length)
    }
    maxCharacter.push(maxLength)
  }

  ws['!cols'] = maxCharacter.map(width => ({ wch: width + 5 }))

  XLSX.utils.book_append_sheet(wb, ws, fileName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
