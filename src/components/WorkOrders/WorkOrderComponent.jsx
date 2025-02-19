import React from 'react'
import { useRouteMatch, Switch, Route, useLocation } from 'react-router-dom'
import WorkOrderList from './WorkOrderList'
//import WorkOrderDetail from './WorkOrderDetail'
import _ from 'lodash'
import AcceptanceTWO from './AcceptanceTWO'
import Backlogs from './Backlogs'
import OnBoardingWorkOrder from 'components/WorkOrders/onboarding'
import WorkorderTabs from './workorder-tabs'

function WorkOrderComponent() {
  const match = useRouteMatch()
  const params = useRouteMatch('/workorders/details/:id')
  const param2 = useRouteMatch('/workorders/onboarding/:id')
  const param3 = useRouteMatch('/workorders/infrared-scan/:id')
  const location = useLocation()
  return (
    <Switch>
      {/* <Route exact path={`${match.path}/backlogs`}>
        <Backlogs />
      </Route> */}
      <Route exact path={match.path}>
        <WorkorderTabs />
      </Route>
      <Route exact path={`${match.path}/details/:id`}>
        <AcceptanceTWO workOrderID={_.get(params, ['params', 'id'])} />
      </Route>
      <Route exact path={`${match.path}/onboarding/:id`}>
        <OnBoardingWorkOrder workOrderID={_.get(param2, ['params', 'id'])} />
      </Route>
      <Route exact path={`${match.path}/infrared-scan/:id`}>
        <OnBoardingWorkOrder workOrderID={_.get(param3, ['params', 'id'])} />
      </Route>
    </Switch>
  )
}

export default WorkOrderComponent
