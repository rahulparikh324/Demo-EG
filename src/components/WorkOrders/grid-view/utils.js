import React from 'react'
import enums from 'Constants/enums'
import { isEmpty, uniqBy, get, startCase } from 'lodash'
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter'
import SelectEditor from '@inovua/reactdatagrid-community/SelectEditor'

const renderStatus = status => {
  const { color, label } = enums.WO_STATUS.find(d => d.value === status.value)
  return <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 12px', borderRadius: '18px', background: `${color}33`, color, border: `1px solid ${color}`, whiteSpace: 'nowrap' }}>{label}</span>
}
const findPath = (ob, key) => {
  const path = []
  const keyExists = obj => {
    if (!obj || (typeof obj !== 'object' && !Array.isArray(obj))) return false
    else if (obj.hasOwnProperty(key)) return true
    else if (Array.isArray(obj)) {
      let parentKey = path.length ? path.pop() : ''

      for (let i = 0; i < obj.length; i++) {
        path.push(`${parentKey}[${i}]`)
        const result = keyExists(obj[i], key)
        if (result) return result
        path.pop()
      }
    } else {
      for (const k in obj) {
        path.push(k)
        const result = keyExists(obj[k], key)
        if (result) return result
        path.pop()
      }
    }
    return false
  }
  keyExists(ob)
  return path.join('.')
}

export const gridDataFormatter = (data, woStatusId, handleClose, formData) => {
  try {
    const formDataComponents = JSON.parse(formData)['components']
    const taskList = get(data, 'data.task_list', [])
    const dynamicFields = get(data, 'data.dynamic_fields', [])
    const filterValues = []
    const groups = dynamicFields.map(({ key }) => ({ name: key.split('.')[0], header: startCase(key.split('.')[0]) }))
    const uniqueStatusValues = uniqBy(taskList, 'status_id').map(d => d.status_id)
    const cols = [
      { header: '#', name: 'serial_number', df: 'serial_number', defaultWidth: 25, group: 'header', defaultLocked: 'start', editable: false },
      {
        header: 'Identification',
        name: 'asset_name',
        df: 'asset_name',
        defaultFlex: 1,
        minWidth: 175,
        filterEditor: SelectFilter,
        filterEditorProps: {
          placeholder: 'All',
          dataSource: uniqBy(taskList, 'asset_name')
            .map(task => ({ id: task.asset_name, label: task.asset_name }))
            .filter(d => Boolean(d.id)),
        },
        group: 'header',
        defaultLocked: 'start',
        editable: false,
      },
      {
        header: 'Parent',
        name: 'location',
        df: 'location',
        defaultFlex: 1,
        minWidth: 175,
        filterEditor: SelectFilter,
        filterEditorProps: {
          placeholder: 'All',
          dataSource: uniqBy(taskList, 'location')
            .map(task => ({ id: task.location, label: task.location }))
            .filter(d => Boolean(d.id)),
        },
        group: 'header',
        defaultLocked: 'start',
        editable: false,
      },
      {
        header: 'Technician',
        name: 'technician_name',
        df: 'technician_name',
        defaultFlex: 1,
        minWidth: 175,
        filterEditor: SelectFilter,
        filterEditorProps: {
          placeholder: 'All',
          dataSource: uniqBy(taskList, 'technician_name')
            .map(task => ({ id: task.technician_name, label: task.technician_name }))
            .filter(d => Boolean(d.id)),
        },
        group: 'header',
        defaultLocked: 'start',
        editable: false,
      },
      {
        header: 'Status',
        name: 'status_id',
        df: 'status_name',
        render: renderStatus,
        defaultFlex: 1,
        minWidth: 175,
        filterEditor: SelectFilter,
        filterEditorProps: {
          placeholder: 'All',
          dataSource: enums.WO_STATUS.map(status => uniqueStatusValues.includes(status.value) && { id: status.value, label: status.label }).filter(d => Boolean(d.id)),
        },
        group: 'header',
        editable: false,
      },
    ]
    const rows = []
    const formObjs = []
    const dataSource = {}
    taskList.forEach(task => {
      const row = { ...task }
      const formData = JSON.parse(task.inspection_form_data)
      formObjs.push(formData)
      dynamicFields.forEach(field => {
        let value = get(formData, field.key, '') || ''
        value = value.toString()
        if (isEmpty(value)) {
          const key = field.key.split('.')[0]
          const path = `${findPath(formData, key)}.${field.key}`
          value = get(formData, path, '') || ''
        }
        const source = get(dataSource, field.key, [])
        if (!isEmpty(value)) dataSource[field.key] = [...source, { id: value, label: value }]
        row[field.key] = value
      })
      rows.push(row)
    })

    const selectTypeRecords = {}

    const generateSelectedTypeRecords = columns => {
      columns.forEach(column => {
        column.components.forEach(cc => {
          if (cc.type === 'select') {
            const value = cc.data.values.map(option => {
              return { ...option, id: option.label }
            })
            selectTypeRecords[cc.label] = value
          }
        })
      })
    }

    const handleComponents = field => {
      if (!field) return
      if (field.type === 'columns') {
        generateSelectedTypeRecords(field.columns)
      } else if (field.type === 'select') {
        const value = field.data.values.map(option => {
          return { ...option, id: option.label }
        })
        selectTypeRecords[field.label] = value
      } else {
        if (field.components) {
          field.components.forEach(comp => {
            handleComponents(comp)
          })
        } else {
          return
        }
      }
    }

    formDataComponents.forEach(field => {
      if (field.components) {
        handleComponents(field.components[0])
      }
    })

    //
    dynamicFields.forEach(field => {
      if (selectTypeRecords[field.value]) {
        cols.push({
          header: field.value,
          name: field.key,
          df: field.key,
          defaultFlex: 1,
          minWidth: 175,
          filterEditor: SelectFilter,
          filterEditorProps: {
            placeholder: 'All',
            dataSource: uniqBy(dataSource[field.key], 'id'),
          },
          group: field.key.split('.')[0],
          editor: SelectEditor,
          editorProps: {
            idProperty: 'id',
            dataSource: selectTypeRecords[field.value],
            collapseOnSelect: true,
            clearIcon: null,
          },
          editable: (value, row) => woStatusId !== enums.woTaskStatus.Complete && ![enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(row.data.status_id),
        })
      } else {
        cols.push({
          header: field.value,
          name: field.key,
          df: field.key,
          defaultFlex: 1,
          minWidth: 175,
          filterEditor: SelectFilter,
          filterEditorProps: {
            placeholder: 'All',
            dataSource: uniqBy(dataSource[field.key], 'id'),
          },
          group: field.key.split('.')[0],
          editable: (value, row) => woStatusId !== enums.woTaskStatus.Complete && ![enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(row.data.status_id),
        })
      }
    })
    //
    cols.forEach(col => {
      if (!['#', 'Status', 'Actions'].includes(col.header)) {
        filterValues.push({ operator: 'eq', name: col.name, df: col.name, type: 'string', value: '' })
      } else if (col.name === 'status_id') {
        filterValues.push({ operator: 'eq', name: col.name, df: col.name, type: 'select', value: null })
      }
    })
    return { columns: cols, rows, filterValues, groups: uniqBy(groups, 'name') }
  } catch (error) {
    console.log(error)
    return { columns: [], rows: [], filterValues: [], groups: [] }
  }
}
