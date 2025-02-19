import _ from 'lodash'

const getTabsContainer = (data, containers) => {
  containers = containers || []
  if (['container'].includes(data.type)) containers.push(_.snakeCase(data.key))
  if (!_.isEmpty(data.components)) data.components.forEach(comp => getTabsContainer(comp, containers))
  return containers
}

export const parseFormData = ({ data, results, tables, tabs, grids, images, rootData, suffixes }) => {
  results = results || []
  tables = tables || []
  tabs = tabs || {}
  grids = grids || {}
  images = images || {}
  rootData = rootData || {}
  suffixes = suffixes || {}
  if (!_.isEmpty(data.suffix)) suffixes[data.key] = data.suffix
  if (['container'].includes(data.type) && !['submit'].includes(data.key)) results.push(_.snakeCase(data.key))
  if (data.type === 'columns') data.columns.forEach(comp => parseFormData({ data: comp, results, tables, tabs, grids, images, rootData, suffixes }))
  if (data.type === 'table') {
    const rows = []
    data.rows.forEach(row => {
      const cols = []
      row.forEach(col => {
        if (!_.isEmpty(col.components) && !_.isEmpty(col.components[0].html)) {
          const text = new DOMParser().parseFromString(col.components[0].html, 'text/html').documentElement.textContent
          col.components[0].type === 'content' ? cols.push(`#${text}`) : cols.push(text)
        } else {
          if (_.isEmpty(col.components)) cols.push('')
          else {
            const text = col.components[0].key.includes('content') ? '' : col.components[0].key
            col.components[0].type === 'content' ? cols.push(`#${text}`) : cols.push(text)
          }
        }
      })
      rows.push(cols)
      row.forEach(col => parseFormData({ data: col, results, tables, tabs, grids, images, rootData, suffixes }))
    })
    tables.push({
      name: results[results.length - 1],
      rows,
      numRows: data.numRows,
      numCols: data.numCols,
    })
  }
  if (data.type === 'tabs') {
    const childrens = getTabsContainer(data)
    const parentKey = results[results.length - 1]
    childrens.forEach(child => (tabs[child] = parentKey))
  }
  if (data.type === 'datagrid') {
    const labels = data.components.map(d => d.label)
    const keys = data.components.map(d => d.key)
    const parentKey = results[results.length - 1]
    grids[parentKey] = { labels, keys, name: data.key }
  }
  if (data.type === 'content') {
    const el = new DOMParser().parseFromString(data.html, 'text/html').documentElement
    const image = el.querySelector('img')
    if (image) {
      const parentKey = results[results.length - 1]
      const _images = images[parentKey]
      if (data.conditional.show) {
        images[parentKey] = { ..._images, [data.conditional.eq]: image.src }
      } else {
        const len = _.isEmpty(_images) ? 0 : Object.keys(_images).length
        images[parentKey] = { ..._images, [len]: image.src }
      }
    }
  }
  if (!_.isEmpty(data.components)) data.components.forEach(comp => parseFormData({ data: comp, results, tables, tabs, grids, images, rootData, suffixes }))
  results = results.filter(d => !['submit', 'copyright'].includes(d))
  return { results, tables, tabs, grids, images, suffixes }
}

export const getFormName = data => {
  const ele = data.components[0]
  const name = new DOMParser().parseFromString(ele.content, 'text/html').documentElement.textContent
  return _.snakeCase(name)
}
