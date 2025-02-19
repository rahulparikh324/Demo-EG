import React, { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'

import 'formiojs/dist/formio.full.min.css'
import 'components/Forms/formbuilder.css'
import './render-form-override.css'

import { get, isEmpty } from 'lodash'
import { Form } from 'react-formio'

import getDataForForms from 'Services/WorkOrder/get-data-for-forms-pdf'

const RenderRdfForm = () => {
  const params = useRouteMatch('/task-forms/:woId')
  const [form, setForm] = useState({})
  const [submission, setSubmission] = useState({})
  useEffect(() => {
    ;(async () => {
      const { data } = await getDataForForms(get(params, ['params', 'woId']))

      const formJSON = get(data, 'master_form_json', {})
      const formDataWithExpaned = formJSON.replaceAll(`"collapsed":true`, `"collapsed":false`)
      const formData = JSON.parse(formDataWithExpaned)
      const parseFormData = async ({ data }) => {
        if (['container'].includes(data.type)) data.customClass = 'avoid-break'
        if (!isEmpty(data.components)) data.components.forEach(comp => parseFormData({ data: comp }))
      }
      parseFormData({ data: formData })
      setForm(formData)

      const submissionData = get(data, 'asset_form_data', {})
      setSubmission(JSON.parse(submissionData))
    })()
  }, [])
  return (
    <div style={{ padding: '20px', fontFamily: 'Manrope-Regular' }}>
      {/* {forms.map((form, index) => ( */}
      <div className={`form-div`}>
        <Form form={form} submission={submission} options={{ readOnly: true }} />
      </div>
      {/* ))} */}
    </div>
  )
}

export default RenderRdfForm
