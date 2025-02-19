import { camelizeKeys } from 'helpers/formatters'

export const formatProperties = data => {
  const x = camelizeKeys(data)
  x.data.forEach(d => {
    const props = JSON.parse(d.assetClassFormProperties)
    // console.log(props)
  })
  return x
}

export const formatAssocaitedForms = data => {
  const x = camelizeKeys(data)
  return x
}

export const formatAssetTypes = data => {
  const x = camelizeKeys(data)
  x.data.list.forEach(d => {
    d.label = d.formTypeName
    d.value = d.formTypeId
  })
  return x.data.list
}
