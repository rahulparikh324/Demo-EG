import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
class InspectionImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
    }
  }
  componentDidMount() {}
  onClose = () => {
    this.setState({ visible: false })
    this.props.closePopUp()
  }
  render() {
    return (
      <div id='myModal' className='modal display-block'>
        {/* <!-- Modal content --> */}
        <div className='modal-content imgmodalmain'>
          <div className='modal-body imgmodalbody'>
            <span className='close cross-btn' onClick={this.onClose}>
              &times;
            </span>

            <TransformWrapper>
              <TransformComponent>
                <img src={this.props.img} alt='' />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      </div>
    )
  }
}
export default InspectionImage
