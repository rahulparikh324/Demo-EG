import React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import generateReportListAction from '../../Actions/reports/generateReportListAction'
import generateReport2ListAction from '../../Actions/reports/generateReport2ListAction'
import generateReport3ListAction from '../../Actions/reports/generateReport3ListAction'
import generateReport4ListAction from '../../Actions/reports/generateReport4ListAction'
import historyOFInspectionAssetReportAction from '../../Actions/reports/historyOFInspectionAssetReportAction'
import generateInspectionOFAssetReportAction from '../../Actions/reports/generateInspectionOFAssetReportAction'
import checkStatusOFInspectionAssetReportAction from '../../Actions/reports/checkStatusOFInspectionAssetReportAction'
import getAllAssetIdListAction from '../../Actions/reports/getAllAssetIdListAction'
import moment from 'moment'
import xls from '../../Content/images/xls.svg'
import Paper from '@material-ui/core/Paper'
import ReactExport from 'react-export-excel'
import momenttimezone from 'moment-timezone'
import CircularProgress from '@material-ui/core/CircularProgress'
import userConstants from '../../Constants/userConstants'
import TablePagination from '@material-ui/core/TablePagination'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { getDateTime } from '../../helpers/getDateTime'

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

const styles = theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  selectEmpty: { marginTop: theme.spacing(2) },
  validation: { color: '#f44336', fontSize: '0.75rem', margin: '0 0 0 14px', paddingTop: '4px' },
  root: { padding: 20, flexGrow: 1, background: '#fff' },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px' },
  warning: { color: '#d50000' },
  fab: { marginRight: theme.spacing(1) },
  buttonText: { fontSize: '12px', textTransform: 'none' },
  searchInput: { fontSize: '8px' },
  disabledDatePicker: { color: '#000000' },
})
var self

var timeInterval
class Reports extends React.Component {
  constructor(props) {
    super(props)
    self = this
    var logindata = localStorage.getItem('loginData')
    logindata = JSON.parse(logindata)
    this.state = {
      loginData: logindata,
      report: '',
      assetId: '',
      fromDate: new Date(),
      toDate: new Date(),
      toMaxDate: '',
      formError: {},
      errorMessage: {},
      isGenerateReport: false,
      isLatestHourReadingReport: false,
      assetInspectionReport: [],
      pageIndex: 1,
      pageSize: 20,
      page: 0,
      rowsPerPage: 20,
      isDataNotFound: false,
      assetIDInputValue: '',
      toastMsg: {},
      inspectionReportInitialList: [],
      inspectionReportMapList: [],
    }

    this.handleReportchnage = this.handleReportchnage.bind(this)
  }
  componentDidMount() {
    var currentDate = moment().format('MM/DD/YYYY')
    this.setState({ toMaxDate: currentDate })
    //console.log('component did mount')

    var timeClear = setInterval(() => {
      let reducer = _.get(this, 'props.reportsReducer')

      if (_.get(reducer, ['historyReportList', 'list'], []).length) {
        var list = reducer.historyReportList.list
        var inProgressReportList = list.filter(x => x.status === enums.reportStatus[0].id)
        if (inProgressReportList.length) {
          var requestData = {
            reports_id: inProgressReportList.map(value => value.report_id),
          }
          //console.log('requestData   ', requestData)
          this.props.checkStatusOFInspectionAssetReportAction(requestData)
        } else {
        }
      }
    }, 5000)

    //console.log('')
  }

  componentWillReceiveProps(nextProps) {
    //console.log('component will receive props call ')

    //console.log('nextProps ', nextProps.reportsReducer)
    //console.log(' this.state.assetInspectionReport', this.state.assetInspectionReport)

    let reducer = nextProps.reportsReducer
  }
  futureMonth = (date, month) => {
    var currentDate = moment(date).format('MM/DD/YYYY')
    var futureMonth = moment(currentDate).add(month, 'M').format('MM/DD/YYYY')
    var futuredate = moment(futureMonth).subtract(1, 'days').format('MM/DD/YYYY')

    //console.log('current date ', currentDate)
    //console.log('future month ', futureMonth)
    this.setState({ toMaxDate: futuredate })
  }

  handleReportchnage = e => {
    const { formError, errorMessage } = this.state
    const { name, value } = e.target

    //console.log('name value', name, ' ', value)

    if (value === enums.reportType[3].type) {
      this.setState({ isLatestHourReadingReport: true })
    } else {
      this.setState({ isLatestHourReadingReport: false })
    }

    this.setState({ [name]: value, isGenerateReport: false, fromDate: new Date(), toDate: new Date() })

    if (value === enums.reportType[4].type) {
      this.futureMonth(this.state.fromDate, 3)

      $('#pageLoading').show()
      var requestData = '?pagesize=' + 0 + '&pageindex=' + 0
      this.props.historyOFInspectionAssetReportAction(requestData, this.state.pageIndex)
      this.setState({ isGenerateReport: true })
      this.props.getAllAssetIdListAction(this.state.loginData.uuid)
    } else {
      var currentDate = moment().format('MM/DD/YYYY')
      this.setState({ toMaxDate: currentDate })
    }

    if (value !== '' || value !== null) {
      delete formError[name]
      delete errorMessage[name]
    }
    this.setState({ formError, errorMessage })
  }
  handlefromDateChange = date => {
    //console.log('form date change call')

    const { formError, errorMessage } = this.state

    delete formError['fromDate']
    delete errorMessage['fromDate']
    delete formError['fromDate1']
    delete errorMessage['fromDate1']
    this.setState({ fromDate: date, formError, errorMessage, toDate: date, formError, errorMessage })

    const today = new Date(date)
    const day90 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 89)

    if (this.state.report === enums.reportType[4].type) {
      //this.futureMonth(date, 3)
      this.setState({ toMaxDate: day90 })
    }
  }
  handleToDateChange = date => {
    const { formError, errorMessage } = this.state

    delete formError['toDate']
    delete errorMessage['toDate']
    delete formError['toDate1']
    delete errorMessage['toDate1']
    this.setState({ toDate: date, formError, errorMessage })
  }

  formValidation(report, fromDate, toDate, assetID) {
    //console.log('form validation fun call', this.state.assetId)
    const { formError, errorMessage } = this.state

    var oneYearAfterDate = moment(fromDate).add(1, 'years').calendar()
    oneYearAfterDate = moment(oneYearAfterDate).format('YYYY-MM-DD')
    var currentDate = moment().format('YYYY-MM-DD')
    if (fromDate) {
      fromDate = moment(fromDate).format('YYYY-MM-DD')
    }
    if (toDate) {
      toDate = moment(toDate).format('YYYY-MM-DD')
    }

    if (report === '') {
      formError['report'] = true
      errorMessage['report'] = 'Please select report'
    } else {
      delete formError['report']
      delete errorMessage['report']
    }

    if (fromDate === '' || fromDate === null) {
      formError['fromDate'] = true
      errorMessage['fromDate'] = 'Please select from date'
    } else {
      if (fromDate > currentDate) {
        formError['fromDate'] = true
        errorMessage['fromDate'] = 'Please select valid date'
      } else {
        delete formError['fromDate']
        delete errorMessage['fromDate']
      }
    }

    if (toDate === '' || toDate === null) {
      formError['toDate'] = true
      errorMessage['toDate'] = 'Please select to date'
    } else {
      if (toDate > currentDate) {
        formError['toDate'] = true
        errorMessage['toDate'] = 'Please select valid date'
      } else if (toDate > oneYearAfterDate) {
        formError['toDate'] = true
        errorMessage['toDate'] = 'Maximum difference beetween from date and to date should be 1 year'
      } else {
        if (!_.isEmpty(fromDate) && !_.isEmpty(toDate)) {
          if (fromDate > toDate) {
            formError['fromDate'] = true
            errorMessage['fromDate'] = 'From date should be less than todate'
            formError['toDate'] = true
            errorMessage['toDate'] = 'To date should be greater than from date'
          } else {
            delete formError['toDate']
            delete errorMessage['toDate']
            delete formError['fromDate1']
            delete errorMessage['fromDate1']
            delete formError['toDate1']
            delete errorMessage['toDate1']
          }
        }
      }
    }

    if (this.state.report === enums.reportType[4].type) {
      let pattern = /^[0-9]*$/
      if (this.state.assetId == '') {
        formError['assetId'] = true
        errorMessage['assetId'] = 'Please select asset no'
      } else {
        delete formError['assetId']
        delete errorMessage['assetId']
      }
      //  else if (!pattern.test(this.state.assetId)) {
      //     formError['assetId'] = true
      //     errorMessage['assetId'] = "Please enter number only"
      // }
      // else if (this.state.assetId.length != 6) {
      //     formError['assetId'] = true
      //     errorMessage['assetId'] = "Please enter valid asset no"
      // }

      var currentDate = moment(fromDate).format('YYYY-MM-DD')
      var after3MonthDate = moment(currentDate).add(3, 'M').format('YYYY-MM-DD')

      if (!formError['toDate']) {
        if (toDate > after3MonthDate) {
          formError['toDate'] = true
          errorMessage['toDate'] = 'Please select the date range of 90 days only'
        } else {
          delete formError['toDate']
          delete errorMessage['toDate']
        }
      }
    }

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })
      return false
    } else {
      return true
    }
  }
  handleGenerateReport = () => {
    //this.setState({ isGenerateReport: false })
    var formvalid = this.formValidation(this.state.report, this.state.fromDate, this.state.toDate)
    if (formvalid) {
      if (this.state.report === enums.reportType[0].type) {
        //report 1
        $('#pageLoading').show()
        var urlParameters = moment(this.state.fromDate).format('YYYY-MM-DD') + '/' + moment(this.state.toDate).format('YYYY-MM-DD')
        this.props.generateReportListAction(urlParameters)
        this.setState({ isGenerateReport: true, isLatestHourReadingReport: false })
      } else if (this.state.report === enums.reportType[1].type) {
        //report 2
        $('#pageLoading').show()
        var urlParameters = moment(this.state.fromDate).format('YYYY-MM-DD') + '/' + moment(this.state.toDate).format('YYYY-MM-DD')
        this.props.generateReport2ListAction(urlParameters)
        this.setState({ isGenerateReport: true, isLatestHourReadingReport: false })
      } else if (this.state.report === enums.reportType[2].type) {
        //report 3
        $('#pageLoading').show()
        var urlParameters = moment(this.state.fromDate).format('YYYY-MM-DD') + '/' + moment(this.state.toDate).format('YYYY-MM-DD')
        this.props.generateReport3ListAction(urlParameters)
        this.setState({ isGenerateReport: true, isLatestHourReadingReport: false })
      } else if (this.state.report === enums.reportType[3].type) {
        //report 4
        $('#pageLoading').show()
        var urlParameters = this.state.loginData.uuid
        this.props.generateReport4ListAction(urlParameters)
        this.setState({ isGenerateReport: true, isLatestHourReadingReport: true })
      } else if (this.state.report === enums.reportType[4].type) {
        this.setState({ isGenerateReport: true, isLatestHourReadingReport: false })

        var requestData = {
          requested_by: this.state.loginData.uuid,
          internal_asset_id: this.state.assetId,
          from_date: moment(this.state.fromDate).format('YYYY-MM-DD'),
          to_date: moment(this.state.toDate).format('YYYY-MM-DD'),
          pagesize: this.state.rowsPerPage,
          pageindex: this.state.pageIndex,
        }
        $('#pageLoading').show()
        this.props.generateInspectionOFAssetReportAction(requestData)
      }
    }
  }
  handleOnChnage = (e, value) => {
    const { formError, errorMessage } = this.state
    const { name } = e.target

    //console.log('name value', name, ' ', value)
    delete formError['assetId']
    delete errorMessage['assetId']
    this.setState({ pageIndex: 0, page: 1 })
    if (value) {
      $('#pageLoading').show()
      var requestData = '?pagesize=' + 0 + '&pageindex=' + 0 + '&internal_asset_id=' + value.internal_asset_id
      this.props.historyOFInspectionAssetReportAction(requestData, 1)
      this.setState({ assetId: value.internal_asset_id, formError, errorMessage, pageIndex: 0, page: 0 })
    } else {
      $('#pageLoading').show()
      var requestData = '?pagesize=0&pageindex=0'
      this.props.historyOFInspectionAssetReportAction(requestData, 1)
      this.setState({ assetId: '', formError, errorMessage, pageIndex: 0, page: 0 })
    }
  }

  handleInputOnChnage = (e, newInputValue) => {
    //console.log('handle Input Chnage', newInputValue)
    this.setState({
      assetIDInputValue: newInputValue,
    })
  }
  // Pagination Code Start
  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage })

    this.setState({ pageIndex: newPage })
    //   , () => {
    //   var requestData = '?user_id=' + this.state.loginData.uuid + '&pagesize=' + this.state.rowsPerPage + '&pageindex=' + this.state.pageIndex

    //   if (this.state.isDataNotFound) {
    //   } else {
    //     //$('#pageLoading').show()
    //     //this.props.historyOFInspectionAssetReportAction(requestData, this.state.pageIndex)
    //   }
    // })
  }
  handleChangeRowsPerPage = event => {
    //console.log('chnage row per page----------------', event.target.value, parseInt(event.target.value, 10))
    this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 })

    if (this.props.reportsReducer.historyReportList.list.length <= parseInt(event.target.value, 10)) {
      if (this.props.reportsReducer.historyReportList.list.length !== this.props.reportsReducer.historyReportList.listsize) {
        this.setState({ pageIndex: 1 }, () => {
          var requestData = '?user_id=' + this.state.loginData.uuid + '&pagesize=' + this.state.rowsPerPage + '&pageindex=' + this.state.pageIndex + '&internal_asset_id=' + this.state.assetIDInputValue
          $('#pageLoading').show()
          this.props.historyOFInspectionAssetReportAction(requestData, this.state.pageIndex)
        })
      }
    }
  }
  // Pagination Code End

  render() {
    //console.log('this.props report ', this.props.reportsReducer)
    let reportlist = _.get(this, ['props', 'reportsReducer', 'reportList'], [])

    if (this.state.report === enums.reportType[4].type) {
      reportlist = _.get(this, ['props', 'reportsReducer', 'historyReportList', 'list'], [])
    }

    //console.log('state', this.state)
    //console.log('reportList------------', reportlist)
    var rows = []
    var excelData = []

    const tableHeader = () => {
      var headCells = []
      if (this.state.report == enums.reportType[0].type) {
        headCells = [
          { id: 'yard', numeric: false, disablePadding: false, label: 'Yard' },
          // { id: 'month', numeric: false, disablePadding: false, label: 'Month' },
          { id: 'totalinspection', numeric: false, disablePadding: false, label: 'Submitted Inspection' },
          { id: 'approvedinspection', numeric: false, disablePadding: false, label: 'Approved Inspection' },
        ]
      } else if (this.state.report == enums.reportType[1].type) {
        headCells = [
          { id: 'yard', numeric: false, disablePadding: false, label: 'Yard' },
          // { id: 'week', numeric: false, disablePadding: false, label: 'Week' },
          { id: 'equipment_type', numeric: false, disablePadding: false, label: 'Equipment Type' },
          { id: 'totalinspection', numeric: false, disablePadding: false, label: 'Submitted Inspection' },
          { id: 'approvedinspection', numeric: false, disablePadding: false, label: 'Approved Inspection(%)' },
        ]
      } else if (this.state.report == enums.reportType[2].type) {
        headCells = [
          { id: 'yard', numeric: false, disablePadding: false, label: 'Yard' },
          // { id: 'week', numeric: false, disablePadding: false, label: 'Week' },
          { id: 'internal_asset_id', numeric: false, disablePadding: false, label: 'Asset #' },
          { id: 'asset_name', numeric: false, disablePadding: false, label: 'Asset Name' },
          { id: 'begin_hours', numeric: false, disablePadding: false, label: 'Begin Hours' },
          { id: 'end_hours', numeric: false, disablePadding: false, label: 'End Hours' },
          { id: 'totalinspection', numeric: false, disablePadding: false, label: 'Submitted Inspection' },
          { id: 'approvedinspection', numeric: false, disablePadding: false, label: 'Approved Inspection(%)' },
        ]
      } else if (this.state.report == enums.reportType[3].type) {
        headCells = [
          { id: 'internal_asset_id', numeric: false, disablePadding: false, label: 'Asset Internal Id' },
          { id: 'asset_name', numeric: false, disablePadding: false, label: 'Asset Name' },
          { id: 'meter_hours', numeric: false, disablePadding: false, label: 'Current Meter Hours' },
          { id: 'inspection_date', numeric: false, disablePadding: false, label: 'Latest Inspection Date' },
        ]
      } else if (this.state.report == enums.reportType[4].type) {
        headCells = [
          { id: 'report_id', numeric: false, disablePadding: false, label: 'Report Id' },
          { id: 'asset_name', numeric: false, disablePadding: false, label: 'Asset Name' },
          { id: 'start_date', numeric: false, disablePadding: false, label: 'Start Date' },
          { id: 'end_date', numeric: false, disablePadding: false, label: 'End Date' },
          { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
          { id: 'download_link', numeric: false, disablePadding: false, label: 'Download Link' },
        ]
      }

      return headCells
    }

    const createReport1Data = (yard, approvedinspection, totalinspection) => ({ yard, approvedinspection, totalinspection })
    const createReport2Data = (yard, equipment_type, approvedinspection, totalinspection) => ({ yard, equipment_type, approvedinspection, totalinspection })
    const createReport3Data = (yard, internal_asset_id, asset_name, begin_hours, end_hours, approvedinspection, totalinspection) => ({ yard, internal_asset_id, asset_name, begin_hours, end_hours, approvedinspection, totalinspection })
    const createReport4Data = (internal_asset_id, asset_name, meter_hours, inspection_date, timezone) => ({ internal_asset_id, asset_name, meter_hours, inspection_date, timezone })
    const createReport5Data = (report_id, asset_name, start_date, end_date, status, statusID, download_link) => ({ report_id, asset_name, start_date, end_date, status, statusID, download_link })

    if (reportlist.length > 0) {
      rows = []

      reportlist.map((value, key) => {
        if (this.state.report == enums.reportType[0].type) {
          var result = createReport1Data(value.yard, value.approvedinspection, value.totalinspection)

          rows.push(result)
        } else if (this.state.report == enums.reportType[1].type) {
          var result = createReport2Data(value.yard, value.equipment_type, value.approvedinspection, value.totalinspection)
          rows.push(result)
        } else if (this.state.report == enums.reportType[2].type) {
          var result = createReport3Data(value.yard, value.internal_asset_id, value.asset_name, value.begin_hours, value.end_hours, value.approvedinspection, value.totalinspection)
          rows.push(result)
        } else if (this.state.report == enums.reportType[3].type) {
          var result = createReport4Data(value.internal_asset_id, value.asset_name, value.current_meter_hours, value.latest_inspection_date, value.timezone)
          rows.push(result)
        } else if (this.state.report == enums.reportType[4].type) {
          var result = createReport5Data(value.report_number, value.asset_name, value.from_date, value.to_date, value.status_name, value.status, value.download_link)
          rows.push(result)
        }
      })
    }

    if (reportlist.length > 0) {
      excelData = [...reportlist]

      if (this.state.report == enums.reportType[0].type) {
        var jsonData = JSON.stringify(excelData, null, 2)
        jsonData = JSON.parse(jsonData.split('"yard":').join('"Yard":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"totalinspection":').join('"Total Inspection":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"approvedinspection":').join('"Approved Inspection":'))
        excelData = jsonData
      } else if (this.state.report == enums.reportType[1].type) {
        excelData.map((value, key) => {
          if (value.approvedinspection) {
            value.approvedinspection = parseFloat(value.approvedinspection).toFixed(2)
          }
        })

        var jsonData = JSON.stringify(excelData, null, 2)
        jsonData = JSON.parse(jsonData.split('"yard":').join('"Yard":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"equipment_type":').join('"Equipment Type":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"totalinspection":').join('"Total Inspection":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"approvedinspection":').join('"Approved Inspection(%)":'))
        excelData = jsonData
        //console.log('excel Data------------------', excelData)
      } else if (this.state.report == enums.reportType[2].type) {
        excelData.map((value, key) => {
          if (value.approvedinspection) {
            value.approvedinspection = parseFloat(value.approvedinspection).toFixed(2)
          }
        })

        var jsonData = JSON.stringify(excelData, null, 2)
        jsonData = JSON.parse(jsonData.split('"yard":').join('"Yard":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"internal_asset_id":').join('"Asset #":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"asset_name":').join('"Asset Name":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"begin_hours":').join('"Begin Hours":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"end_hours":').join('"End Hours":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"equipment_type":').join('"Equipment Type":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"totalinspection":').join('"Total Inspection":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"approvedinspection":').join('"Approved Inspection(%)":'))
        excelData = jsonData
        //console.log('excel Data------------------', excelData)
      } else if (this.state.report == enums.reportType[3].type) {
        excelData.map((value, key) => {
          delete value.asset_id
          if (value.inspection_date) {
            value.inspection_date = momenttimezone.utc(value.inspection_date).tz('America/Los_Angeles').format('MM-DD-YYYY hh:mm:ss a')
          }
        })

        var jsonData = JSON.stringify(excelData, null, 2)
        jsonData = JSON.parse(jsonData.split('"internal_asset_id":').join('"Asset Internal Id":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"asset_name":').join('"Asset Name":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"current_meter_hours":').join('"Current Meter Hours":'))
        jsonData = JSON.parse(JSON.stringify(jsonData).split('"latest_inspection_date":').join('"Latest Inspection Date":'))
        excelData = jsonData
        //console.log('excel Data------------------', excelData)
      } else if (this.state.report === enums.reportType[4].type) {
        excelData = []

        var excelData = reportlist.map((value, key) => {
          if (value.start_date) {
            value.start_date = momenttimezone.utc(value.start_date).tz('America/Los_Angeles').format('MM-DD-YYYY')
          }

          if (value.end_date) {
            value.end_date = momenttimezone.utc(value.end_date).tz('America/Los_Angeles').format('MM-DD-YYYY')
          }
          return {
            'Report Id': value.report_number,
            'Asset Name': value.asset_name,
            'Start Date': value.from_date,
            'End Date': value.to_date,
            Status: value.status_name,
            'Download Link': value.download_link,
          }
        })

        var jsonData = JSON.stringify(excelData, null, 2)

        excelData = jsonData
      }
      var excelColumns = Object.keys(excelData[0])
      //console.log('excelColumns', excelColumns)
    }

    const { formError, errorMessage } = this.state
    const { classes } = this.props

    const filterOptions = createFilterOptions({
      matchFrom: 'any',
      stringify: option => option.name.trim() + option.internal_asset_id,
      trim: true,
    })

    return (
      <div className={classes.root}>
        <Grid className='div_center'>
          <Grid className='row'>
            <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-12'>
              <Grid className='inspection-title bottom-lines'>
                <h5>Generate Report</h5>
              </Grid>

              <Grid container>
                <Grid item xs={12}>
                  <Paper className={classes.paper} elevation={0}>
                    <Grid>
                      <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
                        <Grid className='assets-info-container '>
                          <Grid className='row'>
                            <form>
                              <Grid className='assent-info-form-part1'>
                                <Grid className='row'>
                                  <Grid className='col-md-3'>
                                    <div className='drp-priority'>
                                      <Grid className='assets-info-devider ss-multi-select'>
                                        <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                          <InputLabel style={{ background: '#ffffff', paddingLeft: '5px', paddingRight: '5px' }} htmlFor='outlined-age-native-simple' className='input-lbl-drp'>
                                            Select a Report
                                          </InputLabel>
                                          <Select native fullWidth name='report' inputProps={{ name: 'report', id: 'outlined-age-native-simple' }} onChange={e => this.handleReportchnage(e)} error={formError.report}>
                                            <option value=''>None</option>
                                            {enums.reportType.map((value, key) => (
                                              <option value={value.type} key={key}>
                                                {value.type}
                                              </option>
                                            ))}
                                          </Select>
                                          {formError.report ? <div className={classes.validation}>{errorMessage.report}</div> : ''}
                                        </FormControl>
                                      </Grid>
                                    </div>
                                  </Grid>
                                  {this.state.report === enums.reportType[4].type && (
                                    <Grid className='col-md-3'>
                                      <div className='drp-priority'>
                                        <Grid className='assets-info-devider ss-multi-select'>
                                          <Autocomplete
                                            style={{ fontSize: '14px' }}
                                            filterOptions={filterOptions}
                                            id='assetId'
                                            options={_.get(this, ['props', 'reportsReducer', 'assetList'], [])}
                                            getOptionLabel={option => option.name}
                                            name='assetId'
                                            onChange={(e, newValue) => this.handleOnChnage(e, newValue)}
                                            inputValue={this.state.vendorInputValue}
                                            onInputChange={(event, newInputValue) => this.handleInputOnChnage(event, newInputValue)}
                                            noOptionsText='No asset found'
                                            renderInput={params => <TextField {...params} error={formError.assetId} variant='outlined' margin='normal' fullWidth placeholder='Select Asset' name='assetId' helperText={errorMessage.assetId} />}
                                          />
                                        </Grid>
                                      </div>
                                    </Grid>
                                  )}

                                  {!this.state.isLatestHourReadingReport && this.state.report && (
                                    <Grid className='col-md-3'>
                                      <Grid className='assets-info-devider'>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                          <KeyboardDatePicker
                                            margin='normal'
                                            inputVariant='outlined'
                                            id='date-picker-dialog-from'
                                            label='From Date'
                                            format='MM/dd/yyyy'
                                            value={this.state.fromDate}
                                            onChange={this.handlefromDateChange}
                                            KeyboardButtonProps={{ 'aria-label': 'change date' }}
                                            InputProps={{ classes: { disabled: classes.disabledDatePicker } }}
                                            disableFuture='true'
                                            error={formError.fromDate}
                                            helperText={errorMessage.fromDate}
                                            TextFieldComponent={props => <TextField {...props} disabled={true} />}
                                          />
                                        </MuiPickersUtilsProvider>
                                      </Grid>
                                    </Grid>
                                  )}

                                  {!this.state.isLatestHourReadingReport && this.state.report ? (
                                    <Grid className='col-md-3'>
                                      <Grid className='assets-info-devider'>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                          <KeyboardDatePicker
                                            margin='normal'
                                            inputVariant='outlined'
                                            id='date-picker-dialog-to'
                                            label='To Date'
                                            format='MM/dd/yyyy'
                                            value={this.state.toDate}
                                            onChange={this.handleToDateChange}
                                            KeyboardButtonProps={{ 'aria-label': 'change date' }}
                                            disableFuture='true'
                                            maxDate={this.state.toMaxDate}
                                            minDate={this.state.fromDate}
                                            error={formError.toDate}
                                            helperText={errorMessage.toDate}
                                            InputProps={{ classes: { disabled: classes.disabledDatePicker } }}
                                            TextFieldComponent={props => <TextField {...props} disabled={true} />}
                                          />
                                        </MuiPickersUtilsProvider>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    ''
                                  )}
                                  {this.state.report ? (
                                    <Grid className='col-md-3'>
                                      <Grid className='assets-info-devider'>
                                        <Button variant='contained' color='primary' className='assets-bottons txt-normal' style={{ fontSize: '13px', marginTop: '27px', width: 'fit-content' }} onClick={this.handleGenerateReport}>
                                          Generate
                                        </Button>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    ''
                                  )}
                                </Grid>
                              </Grid>
                            </form>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {this.state.isGenerateReport ? (
                // <Grid className="assets-wrap-container padding-sections reportTbl root" >
                <Grid container className={classes.root}>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Grid xs={12} className='text-right'>
                        {/* <CSVLink data={excelData} filename="ReportExcelFile.xls">
                                           <img src={xls} className="dwndl_btn_icon"></img>
                                       </CSVLink> */}

                        {this.state.report !== enums.reportType[4].type && reportlist.length !== 0 && (
                          <ExcelFile
                            element={
                              <button style={{ outline: 'none', border: 'none', background: 'none' }} disabled={reportlist.length === 0}>
                                <img src={xls} className='dwndl_btn_icon' />
                              </button>
                            }
                            filename='ReportExcelFile'
                          >
                            <ExcelSheet data={excelData} name='Employees'>
                              {_.map(excelColumns, function (value, key) {
                                return <ExcelColumn label={value} value={value} />
                              })}
                            </ExcelSheet>
                          </ExcelFile>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Table size='small' stickyHeader={true}>
                          <TableHead>
                            <TableRow>
                              {tableHeader().map((headCell, key) => {
                                return (
                                  <TableCell key={key} id={headCell.id} align={headCell.id == 'download_link' ? 'center' : 'left'} padding={headCell.disablePadding ? 'none' : 'default'}>
                                    {headCell.label}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          </TableHead>
                          {_.isEmpty(rows) ? (
                            ''
                          ) : (
                            <TableBody>
                              {this.state.report == enums.reportType[0].type
                                ? rows.map((tableRow, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>{tableRow.yard ? tableRow.yard : '-'}</TableCell>
                                        {/* <TableCell className={classes.tableCell}>{tableRow.month != undefined ? tableRow.month : '-'}</TableCell> */}
                                        <TableCell className={classes.tableCell}>{tableRow.totalinspection != undefined ? tableRow.totalinspection : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.approvedinspection != undefined ? tableRow.approvedinspection : '-'}</TableCell>
                                      </TableRow>
                                    )
                                  })
                                : ''}
                              {this.state.report == enums.reportType[1].type
                                ? rows.map((tableRow, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>{tableRow.yard ? tableRow.yard : '-'}</TableCell>
                                        {/* <TableCell className={classes.tableCell}>{tableRow.week ? tableRow.week : '-'}</TableCell> */}
                                        <TableCell className={classes.tableCell}>{tableRow.equipment_type ? tableRow.equipment_type : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.totalinspection != undefined ? tableRow.totalinspection : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.approvedinspection != undefined ? parseFloat(tableRow.approvedinspection).toFixed(2) : '-'}</TableCell>
                                      </TableRow>
                                    )
                                  })
                                : ''}
                              {this.state.report == enums.reportType[2].type
                                ? rows.map((tableRow, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>{tableRow.yard ? tableRow.yard : '-'}</TableCell>
                                        {/* <TableCell className={classes.tableCell}>{tableRow.week ? tableRow.week : '-'}</TableCell> */}
                                        <TableCell className={classes.tableCell}>{tableRow.internal_asset_id ? tableRow.internal_asset_id : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.asset_name ? tableRow.asset_name : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.begin_hours != undefined ? tableRow.begin_hours : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.end_hours != undefined ? tableRow.end_hours : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.totalinspection != undefined ? tableRow.totalinspection : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.approvedinspection != undefined ? parseFloat(tableRow.approvedinspection).toFixed(2) : '-'}</TableCell>
                                      </TableRow>
                                    )
                                  })
                                : ''}

                              {this.state.report == enums.reportType[3].type
                                ? rows.map((tableRow, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>{tableRow.internal_asset_id ? tableRow.internal_asset_id : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.asset_name ? tableRow.asset_name : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.meter_hours != undefined ? tableRow.meter_hours : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.inspection_date ? getDateTime(tableRow.inspection_date, tableRow.timezone) : '-'}</TableCell>
                                      </TableRow>
                                    )
                                  })
                                : ''}
                              {this.state.report == enums.reportType[4].type
                                ? rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((tableRow, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>{tableRow.report_id ? tableRow.report_id : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.asset_name ? tableRow.asset_name : '-'}</TableCell>
                                        <TableCell className={classes.tableCell}>
                                          {tableRow.start_date != undefined
                                            ? moment(tableRow.start_date).format('MM-DD-YYYY')
                                            : // momenttimezone.utc(tableRow.start_date).tz("America/Los_Angeles").format('MM-DD-YYYY')
                                              '-'}
                                        </TableCell>
                                        <TableCell className={classes.tableCell}>
                                          {tableRow.end_date != undefined
                                            ? moment(tableRow.end_date).format('MM-DD-YYYY')
                                            : // momenttimezone.utc(tableRow.end_date).tz("America/Los_Angeles").format('MM-DD-YYYY')
                                              '-'}
                                        </TableCell>
                                        <TableCell className={classes.tableCell}>{tableRow.status != undefined ? tableRow.status : '-'}</TableCell>
                                        <TableCell className={classes.tableCell} style={{ textAlign: 'center' }}>
                                          {tableRow.statusID == enums.reportStatus[0].id ? (
                                            <CircularProgress />
                                          ) : tableRow.statusID == enums.reportStatus[1].id ? (
                                            <a href={tableRow.download_link}>
                                              <ArrowDownwardIcon color='primary' />
                                            </a>
                                          ) : (
                                            '-'
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                : ''}
                            </TableBody>
                          )}
                        </Table>
                        {_.isEmpty(rows) ? <div className='report-nodata'>No data found</div> : ''}
                        {this.state.report == enums.reportType[4].type ? (
                          _.isEmpty(rows) ? (
                            ''
                          ) : (
                            <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.props.reportsReducer.historyReportList.listsize} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onChangePage={this.handleChangePage} onChangeRowsPerPage={this.handleChangeRowsPerPage} />
                          )
                        ) : (
                          ''
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                // </Grid>
                ''
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}
function mapStateToProps(state) {
  //console.log('map state---------', state.reportsReducer)
  if (state.reportsReducer) {
    if (state.reportsReducer.type) {
      if (state.reportsReducer.type == userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_SUCCESS) {
        $('#pageLoading').show()
        if (self) {
          self.setState({ rowsPerPage: 20, pageIndex: 1 }, () => {
            var requestData = '?user_id=' + self.state.loginData.uuid + '&internal_asset_id=' + self.state.assetId + '&pagesize=' + self.state.rowsPerPage + '&pageindex=' + self.state.pageIndex
            self.props.historyOFInspectionAssetReportAction(requestData, self.state.pageIndex)
          })
        }
      }
      if (state.reportsReducer.type == userConstants.HISTORY_OF_INSPECTION_ASSET_REPORT_SUCCESS) {
        if (self) {
          self.setState({
            assetInspectionReport: state.reportsReducer.historyReportList.list,
            isDataNotFound: state.reportsReducer.historyReportList.isDataNoFound,
          })
        }
      }

      if (state.reportsReducer.type == userConstants.CHECK_STATUS_INSPECTION_OF_ASSET_REPORT_SUCCESS) {
        if (self) {
          const requestData = `?user_id=${self.state.loginData.uuid}&pagesize=0&pageindex=0&internal_asset_id=${self.state.assetId}`
          self.props.historyOFInspectionAssetReportAction(requestData, 1)
        }
      }
      if (state.reportsReducer.type == userConstants.GENERATE_INSPECTION_OF_ASSET_REPORT_FAILURE) {
        if (self) {
          self.setState({ toastMsg: state.reportsReducer.tostMsg })
        }
      }
    }
  }
  return state
}

const actionCreators = {
  generateReportListAction: generateReportListAction,
  generateReport2ListAction: generateReport2ListAction,
  generateReport3ListAction: generateReport3ListAction,
  generateReport4ListAction: generateReport4ListAction,
  checkStatusOFInspectionAssetReportAction: checkStatusOFInspectionAssetReportAction,
  generateInspectionOFAssetReportAction: generateInspectionOFAssetReportAction,
  historyOFInspectionAssetReportAction: historyOFInspectionAssetReportAction,
  getAllAssetIdListAction: getAllAssetIdListAction,
}

Reports.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapStateToProps, actionCreators)(withStyles(styles)(Reports))
