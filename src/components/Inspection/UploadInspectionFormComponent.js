import React from 'react'
import XLSX from 'xlsx'
import { make_cols } from './MakeColumns'
import { SheetJSFT } from './type'
import { connect } from 'react-redux'
import getAllCompanyAction from '../../Actions/getAllCompanyAction'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import $ from 'jquery'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import _ from 'lodash'
import uploadInspectionFormsAction from '../../Actions/Inspection/uploadInspectionFormsAction'
import moment from 'moment'
const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  validation: {
    color: '#f44336',
    fontSize: '0.75rem',
    margin: '0 0 -15px 14px',
    paddingTop: '4px',
  },
})

var self
class UploadInspectionForm extends React.Component {
  constructor() {
    super()
    self = this
    this.state = {
      AllCompany: JSON.parse(localStorage.getItem('AllCompany')),
      file: {},
      data: [],
      cols: [],
      isLoading: false,
      company: '',
      formError: {},
      errorMessage: {},
      tostMsg: {},
    }
    this.handleFile = this.handleFile.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleDrpChange = this.handleDrpChange.bind(this)
  }
  componentDidMount() {
    $('#pageLoading').show()
    this.props.getAllCompany()
  }
  formValidation(file, comapny) {
    //console.log('comapny----', comapny)
    const { formError, errorMessage } = this.state
    if (!_.isEmpty(file.name)) {
      var fileSplitArr = file.name.split('.')
      var extension = fileSplitArr.pop()
    }

    if (_.isEmpty(file.name)) {
      formError['file'] = true
      errorMessage['file'] = 'Please select file'
    } else {
      //console.log('else------------', extension)
      if (extension === 'csv' || extension === 'xls' || extension === 'xlsx' || extension === 'xlsm' || extension === 'xltx' || extension === 'xltm') {
      } else {
        formError['file'] = true
        errorMessage['file'] = 'Kindly select file with proper format'
      }
    }

    if (comapny === '') {
      formError['comapny'] = true
      errorMessage['comapny'] = 'Please select company'
    } else {
      delete formError['comapny']
    }
    //console.log('formError---------', formError)
    //console.log(errorMessage)
    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })
      return false
    } else {
      return true
    }
  }
  handleChange(e) {
    //console.log(e.target.files)
    const files = e.target.files

    const { formError, errorMessage } = this.state

    if (files && files[0]) this.setState({ file: files[0] })

    if (files.length > 0) {
      delete formError['file']
      delete errorMessage['file']
    }

    this.setState({ formError, errorMessage })
  }

  handleFile(e) {
    var formvalid = this.formValidation(this.state.file, this.state.company)
    if (formvalid) {
      $('#pageLoading').show()
      /* Boilerplate to set up FileReader */
      const reader = new FileReader()
      const rABS = !!reader.readAsBinaryString

      reader.onload = e => {
        /* Parse data */
        const bstr = e.target.result
        const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true, cellDates: true })
        /* Get first worksheet */
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { raw: true, defval: null, dateNF: 'DD-MM-YYYY' })
        /* Update state */
        this.setState({ data: data, cols: make_cols(ws['!ref']) }, () => {
          var jsonData = JSON.stringify(this.state.data, null, 2)
          // //console.log('jsondata------------',jsonData,JSON.parse(jsonData));
          var inspectionObject = { inspection_form: [] }

          var colObj = []
          var inspectionFormAttributes = []
          var position = []
          var requestData = {
            company_id: this.state.company,
            inspection: [],
          }
          // //console.log("Json Data------------------",jsonData);

          JSON.parse(jsonData).map((value, key) => {
            if (key === 0) {
              //prepare all object key

              _.forOwn(value, function (value1, key1) {
                if (key1.includes('__EMPTY')) {
                } else {
                  position.push(Object.keys(value).indexOf(key1))
                }
              })

              _.forOwn(value, function (value2, key2) {
                if (Object.keys(value).indexOf(key2) < position[0]) {
                  colObj.push(value2)
                  inspectionObject[value2] = ''
                } else {
                  inspectionObject['inspection_form'].push({ name: value2, value: '' })
                  inspectionFormAttributes.push({ name: value2, value: '' })
                  colObj.push(value2)
                }
              })
            }
            return
          })

          var FinalInspectionFormAttr = []
          JSON.parse(jsonData).map((value, key) => {
            inspectionObject = { inspection_form: inspectionFormAttributes }
            var arrInsForm = []
            var i = 0
            if (key !== 0) {
              //fill object values

              _.forOwn(value, function (value2, key2) {
                if (Object.keys(value).indexOf(key2) < position[0]) {
                  var ikey = colObj[Object.keys(value).indexOf(key2)]

                  inspectionObject[ikey] = value2
                } else {
                  arrInsForm.push({ name: colObj[i], value: value2 })
                }
                i++
              })
              inspectionObject['inspection_form'] = arrInsForm
              requestData.inspection.push(inspectionObject)

              FinalInspectionFormAttr.push({ inspection_form: arrInsForm })
            }
            return
          })

          requestData.inspection.forEach(value => {
            //console.log('value---------', value.meter_hours)
            //console.log(value.shift)
            if (value.internal_asset_id) {
              var assetId = value.internal_asset_id
              value.internal_asset_id = assetId.toString()
            }
            if (value.meter_hours) {
              value.meter_hours = parseInt(value.meter_hours)
            }
            if (value.shift) {
              value.shift = parseInt(value.shift)
            }
            if (value.inspection_date) {
              value.inspection_date = moment(value.inspection_date).add(1, 'days').format('YYYY-MM-DD')
            }
          })
          //console.log('requestData', requestData)
          // //console.log("FinalInspectionForm",FinalInspectionForm);
          this.props.uploadInspectionFormsAction(requestData)
        })
      }

      if (rABS) {
        reader.readAsBinaryString(this.state.file)
      } else {
        reader.readAsArrayBuffer(this.state.file)
      }
    } else {
    }
  }
  handleDrpChange(e) {
    const { formError, errorMessage } = this.state
    this.setState({ company: e.target.value })
    //console.log(' e.target.value ', e.target.value)
    if (!_.isEmpty(e.target.value)) {
      delete formError['comapny']
      delete errorMessage['comapny']
    }
    this.setState({ formError, errorMessage })
  }
  render() {
    const { formError, errorMessage } = this.state
    const { classes } = this.props
    var companyList = []
    companyList = _.get(this, ['props', 'companyList'], [])

    return (
      <div className='center_file_upload'>
        <h3>Upload Inspection Forms</h3>
        <div>
          <Grid className='assets-info-devider'>
            <FormControl fullWidth variant='outlined' className={classes.formControl}>
              <InputLabel
                style={{
                  background: '#eee',
                  paddingLeft: '5px',
                  paddingRight: '5px',
                }}
                htmlFor='outlined-age-native-simple'
              >
                Select a Company{' '}
              </InputLabel>
              <Select
                error={formError.comapny}
                helperText={errorMessage.comapny}
                native
                fullWidth
                onChange={e => this.handleDrpChange(e)}
                inputProps={{
                  name: 'Company',
                  id: 'outlined-age-native-simple',
                }}
              >
                <option value='' />
                {companyList.length > 0
                  ? companyList.map((value, key) => {
                      return (
                        <option value={value.company_id} key={key}>
                          {value.company_name}
                        </option>
                      )
                    })
                  : ''}
              </Select>
              {formError.comapny ? <div className={classes.validation}>{errorMessage.comapny}</div> : ''}
            </FormControl>
          </Grid>
          <TextField error={formError.file} helperText={errorMessage.file} accept={SheetJSFT} variant='outlined' margin='normal' fullWidth name='file' type='file' id='file' onChange={e => this.handleChange(e)} />
          <Button type='submit' fullWidth variant='contained' color='primary' onClick={this.handleFile}>
            Upload Inspection Forms
          </Button>
          {/* <div className="for_psw" style={{"marginTop":"10px"}}><a href={URL.sampleXslxDev} download >Download sample file</a></div> */}
        </div>
      </div>
    )
  }
}
function mapState(state) {
  if (state.inspectionListReducer) {
    //console.log('mapState---------', state.inspectionListReducer)
    $('#file').val('')
    $('#outlined-age-native-simple').val('')
    if (self) {
      self.setState({ file: '', company: '' })
      if (!_.isEmpty(state.inspectionListReducer.tostMsg)) {
        self.setState({ tostMsg: state.inspectionListReducer.tostMsg })
      }
    }
    if (state.inspectionListReducer.error) {
      if (self) {
        self.props.getAllCompany()
      }
    }
  }

  return state.uploadAssetReducer
}

const actionCreators = {
  getAllCompany: getAllCompanyAction,
  uploadInspectionFormsAction: uploadInspectionFormsAction,
}
UploadInspectionForm.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapState, actionCreators)(withStyles(styles)(UploadInspectionForm))
