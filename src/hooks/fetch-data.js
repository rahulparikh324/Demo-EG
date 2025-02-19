import { useState } from 'react'
import { useDeepCompareEffect } from 'react-use'
import $ from 'jquery'

const useFetchData = ({ fetch, payload, defaultValue = {}, formatter = data => data, externalLoader, condition = true }) => {
  const [loading, setLoading] = useState(true)
  const [refertcher, setRefertcher] = useState(0)
  const [data, setData] = useState(defaultValue)
  const reFetch = () => setRefertcher(p => p + 1)
  const initialLoading = refertcher === 0 && loading

  useDeepCompareEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        if (externalLoader) $('#pageLoading').show()
        if (condition) {
          const data = await fetch(payload)
          const formattedData = await formatter(data)
          setData(formattedData)
        }
        setLoading(false)
        if (externalLoader) $('#pageLoading').hide()
      } catch (error) {
        setData({})
        setLoading(false)
      }
    })()
  }, [payload, refertcher, condition])
  return { loading, data, reFetch, initialLoading }
}

export default useFetchData
