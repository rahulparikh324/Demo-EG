import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import InspectionList from './InspectionListComponent'
import InspectionDetails from './inspectionDetailComponent'
import InspectionPhoto from '../Inspection/inspectionPhotoComponent'
import UploadInspectionFormComponent from '../Inspection/UploadInspectionFormComponent'
import _ from 'lodash'

const Inspections = () => {
  let match = useRouteMatch()
  // var logindata = localStorage.getItem('loginData')
  // logindata = JSON.parse(logindata)
  let params = useRouteMatch('/inspections/details/:inspectionId')
  let paramsPhoto = useRouteMatch('/inspections/photo/:inspectionId')
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/details/:inspectionId`}>
          <InspectionDetails inspectionId={_.get(params, ['params', 'inspectionId'])} />
        </Route>
        <Route exact path={`${match.path}/photo/:inspectionId`}>
          <InspectionPhoto inspectionId={_.get(paramsPhoto, ['params', 'inspectionId'])} />
        </Route>
        <Route exact path={match.path}>
          <InspectionList />
        </Route>
        <Route exact path={`${match.path}/upload`}>
          <UploadInspectionFormComponent />
        </Route>
        <Redirect to={match.path} />
      </Switch>
    </div>
  )
}

export default Inspections
