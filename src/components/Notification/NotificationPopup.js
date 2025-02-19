import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import _ from 'lodash'
import { connect } from 'react-redux'
import notificationAction from '../../Actions/notificationAction'
import notificationList from '../../Services/getNotificationListService'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import NotificationCard from './NotificationCard'
import NotificationLoader from './NotificationLoader'
import InfiniteScroll from 'react-infinite-scroll-component'
import markAllNotificationAsRead from '../../Services/markAllNotificationAsRead'
import './notification.css'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({})

class NotificationPopup extends Component {
  constructor(props) {
    super(props)
    var loginData = localStorage.getItem('loginData')
    this.state = {
      loginData: JSON.parse(loginData),
      pageIndex: 1,
      page: 0,
      rowsPerPage: 20,
      loading: true,
      notifications: [],
      size: 0,
      hasMore: false,
    }
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.closeModal()
    }
  }

  setWrapperRef = node => (this.wrapperRef = node)

  async componentDidMount() {
    const list = await notificationList(`${this.state.rowsPerPage}/${this.state.pageIndex}`, this.state.pageIndex)
    this.setState({
      loading: false,
      notifications: list.data.data.list,
      size: list.data.data.listsize,
      hasMore: list.data.data.list.length < list.data.data.listsize,
    })
    //
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  closeModal = () => this.props.closeNotificationPopup()

  fetchMore = () => {
    this.setState({ pageIndex: this.state.pageIndex + 1 }, async () => {
      const list = await notificationList(`${this.state.rowsPerPage}/${this.state.pageIndex}`, this.state.pageIndex)
      this.setState({ loading: false, notifications: [...this.state.notifications, ...list.data.data.list], size: list.data.data.listsize, hasMore: list.data.data.list.length === 20 })
    })
  }

  markAllAsRead = async () => {
    try {
      this.setState({ loading: true })
      const res = await markAllNotificationAsRead()
      if (res.success === 1) {
        const list = await notificationList(`${this.state.rowsPerPage}/${1}`, 1)
        this.setState({
          loading: false,
          notifications: list.data.data.list,
          size: list.data.data.listsize,
          hasMore: list.data.data.list.length < list.data.data.listsize,
        })
      }
    } catch (error) {
      this.setState({ loading: false })
    }
  }

  render() {
    const { classes, theme } = this.props
    return (
      <Grid id='divID'>
        <div id='notificationModal' className='modal  notification_modal' style={{ display: 'block' }}>
          <div className='modal-content notification_modal_content' ref={this.setWrapperRef}>
            <div className='modal-header modal-header-notification d-flex flex-row justify-content-between align-items-center px-3' style={{ background: theme.palette.primary.main }}>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Notifications</div>
              <IconButton aria-label='close' size='small' onClick={this.closeModal}>
                <CloseIcon style={{ color: '#fff' }} />
              </IconButton>
            </div>

            <div className='modal-body scroll_height' id='style-1'>
              <div className='d-flex flex-row justify-content-between align-items-center mb-1'>
                <div className='notification-card-desc'>Latest</div>
                <button className='mark-all-as-read' onClick={() => this.markAllAsRead()} style={{ color: theme.palette.primary.main }}>
                  Mark all as read
                </button>
              </div>
              {this.state.loading ? (
                <NotificationLoader />
              ) : !_.isEmpty(this.state.notifications) ? (
                <InfiniteScroll
                  //
                  dataLength={this.state.notifications.length}
                  next={this.fetchMore}
                  hasMore={this.state.hasMore}
                  loader={<NotificationLoader />}
                  scrollableTarget='style-1'
                >
                  {this.state.notifications.map(value => (
                    <NotificationCard key={value.notification_id} value={value} />
                  ))}
                </InfiniteScroll>
              ) : (
                <div>No Notifications Yet</div>
              )}
            </div>
          </div>
        </div>
      </Grid>
    )
  }
}
function mapState(state) {
  return state.notificationListReducer
}

const actionCreators = {
  notificationAction: notificationAction,
}
export default connect(mapState, actionCreators)(withStyles(styles, { withTheme: true })(NotificationPopup))
