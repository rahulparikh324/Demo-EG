import React from 'react'
import XLSX from 'xlsx'
import { make_cols } from './MakeColumns'
import { SheetJSFT } from './type'
import { connect } from 'react-redux'
import uploadAssetAction from '../../Actions/Assets/uploadAssetAction'
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
import URL from '../../Constants/apiUrls'
import { AppendRandomValueToS3Url } from 'components/WorkOrders/onboarding/utils'

const styles = theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  selectEmpty: { marginTop: theme.spacing(2) },
  validation: { color: '#f44336', fontSize: '0.75rem', margin: '0 0 -15px 14px', paddingTop: '4px' },
})

var self
class UploadAsset extends React.Component {
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
    //$('#pageLoading').show()
    //this.props.getAllCompany()
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
        const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true })
        /* Get first worksheet */
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws)
        /* Update state */
        this.setState({ data: data, cols: make_cols(ws['!ref']) }, () => {
          var jsonData = JSON.stringify(this.state.data, null, 2)

          jsonData = JSON.parse(jsonData.split('"Object":').join('"internal_asset_id":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Name":').join('"name":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Parent":').join('"parent":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Children":').join('"children":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Object type":').join('"asset_type":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Product":').join('"product_name":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Model":').join('"model_name":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Serial number":').join('"asset_serial_number":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Model year":').join('"model_year":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Functional location":').join('"site_location":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Current stage":').join('"current_stage":'))
          jsonData = JSON.parse(JSON.stringify(jsonData).split('"Inspection Form":').join('"inspectionform_id":'))

          if (jsonData.length > 0) {
            jsonData.map((obj, key) => {
              for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                  obj[k] = String(obj[k])
                }
              }
              return null
            })
          }

          var requestObj = {
            company_id: this.state.company,
            AssetRequestModel: jsonData,
          }
          //console.log('request data----------------')
          //console.log(requestObj)

          this.props.uploadAssetAction(requestObj)
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
      <div>
        <div className='center_file_upload'>
          <h3>Upload Assets</h3>
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
                  helpertext={errorMessage.comapny}
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
              Upload Assets
            </Button>
            <div className='for_psw' style={{ marginTop: '10px' }}>
              <a href={AppendRandomValueToS3Url(URL.sampleXslxProd)} download>
                Download sample file
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
function mapState(state) {
  if (state.uploadAssetReducer) {
    //console.log('mapState---------', state.uploadAssetReducer)
    $('#file').val('')
    $('#outlined-age-native-simple').val('')
    if (self) {
      self.setState({ file: '', company: '', tostMsg: state.uploadAssetReducer.tostMsg })
    }

    if (state.uploadAssetReducer.error) {
      if (self) {
        self.setState({ tostMsg: state.uploadAssetReducer.tostMsg })
        setTimeout(() => {
          self.props.getAllCompany()
        }, 1000)
      }
    }
  }

  return state.uploadAssetReducer
}

const actionCreators = {
  uploadAssetAction: uploadAssetAction,
  getAllCompany: getAllCompanyAction,
}
UploadAsset.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapState, actionCreators)(withStyles(styles)(UploadAsset))
