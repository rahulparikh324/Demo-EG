import { get, isEmpty, merge, keys, pickBy, upperCase } from 'lodash'

const renderTemplate = (template, body, obj, suffixes, key) => {
  template.body.forEach(row => {
    const _row = []
    row.forEach(col => {
      let value
      if (col.startsWith('#')) value = col.slice(1)
      else if (col.startsWith('*')) {
        const key = col.split('*').slice(1)[0]
        value = `${get(obj, key, '')} ${get(suffixes, key, '')}`
      } else if (col.startsWith('~')) {
        const keys = col.slice(1).split('|')
        keys.forEach(key => {
          if (!isEmpty(get(obj, key, ''))) value = `${get(obj, key, '')} ${get(suffixes, key, '')}`
        })
      } else if (col.startsWith('xCHECKBOX')) {
        const key = col.slice(10)
        const checkboxes = get(obj, key, {})
        value = upperCase(keys(pickBy(checkboxes))[0])
      } else if (col.startsWith('xCONDITION')) {
        const cond = col.slice(11)
        value = eval(cond)
      } else value = `${get(obj, col, '')} ${get(suffixes, col, '')}`
      _row.push(value)
    })
    body.push(_row)
  })
  if (template.hasGrid) {
    const grid = obj.dataGrid || []
    if (!template.isNestedGrid) {
      grid.forEach(row => {
        const _row = []
        template.gridRow.forEach(gridKeyName => _row.push(row[gridKeyName]))
        body.push(_row)
      })
    } else {
      grid.forEach(row => {
        const gridObj = {}
        Object.keys(row).forEach(key => merge(gridObj, row[key]))
        template.gridRow.forEach(gridKeys => {
          const _row = []
          gridKeys.forEach(key => {
            let value
            if (key.startsWith('#')) value = key.slice(1)
            else value = `${get(gridObj, key, '')}`
            _row.push(value)
          })
          body.push(_row)
        })
      })
      //console.log(grid, template.gridRow)
    }
  }
  if (template.hasDataAfterGrid) {
    template.afterGridBody.forEach(row => {
      const _row = []
      row.forEach(col => {
        let value
        if (col.startsWith('#')) value = col.slice(1)
        else if (col.startsWith('*')) {
          const key = col.split('*').slice(1)[0]
          value = `${get(obj, key, '')} ${get(suffixes, key, '')}`
        } else value = `${get(obj, col, '')} ${get(suffixes, col, '')}`
        _row.push(value)
      })
      body.push(_row)
    })
  }
}

export default renderTemplate
