import XLSX from 'xlsx'
import { data } from './json-data'
import { cloneDeep } from 'lodash'

export const bulkUpload = e => {
  const iterateOverObject = (obj, sheet) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        iterateOverObject(obj[key], sheet)
      } else {
        const jsonKey = obj[key]
        obj[key] = sheet[jsonKey] || jsonKey
      }
    })
  }

  e.preventDefault()
  if (!e.target.files[0]) return
  const reader = new FileReader()
  const file = e.target.files[0]
  console.log(data.data)
  reader.onload = d => {
    const extension = file.name.split('.').slice(-1).pop()
    if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) return
    else {
      const binaryStr = d.target.result
      const wb = XLSX.read(binaryStr, { type: 'binary' })
      const wsname = wb.SheetNames[1]
      const ws = wb.Sheets[wsname]
      const sheetData = XLSX.utils.sheet_to_json(ws)
      const obj = cloneDeep(data.data)
      console.log(sheetData)
      // iterateOverObject(obj, sheetData[0])
      // console.log(obj)
    }
  }
  reader.readAsBinaryString(file)
  e.target.value = null
}
