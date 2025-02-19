import { useState } from 'react'
import $ from 'jquery'
import { Toast } from 'Snackbar/useToast'
import { isEmpty } from 'lodash'

const usePostData = ({ executer, postSuccess = () => {}, postError = () => {}, externalLoader, message, hideMessage = false }) => {
  const [loading, setLoading] = useState(false)
  const mutate = async payload => {
    try {
      setLoading(true)
      if (externalLoader) $('#pageLoading').show()
      const res = await executer(payload)
      if (res.success > 0) {
        !hideMessage && Toast.success(!isEmpty(message.success) ? message.success : res.message)
      } else
        Toast.error(
          res.message ||
            `Oops! Something went wrong, please try again.
            Contact Support if the problem persists!`
        )
      setLoading(false)
      if (externalLoader) $('#pageLoading').hide()
      postSuccess(res)
    } catch (error) {
      setLoading(false)
      Toast.error(`Oops! Something went wrong, please try again.
      Contact Support if the problem persists!`)
      postError(error)
    }
  }

  return { loading, mutate }
}

export default usePostData
