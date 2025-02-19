import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import WorkOrderDetails from './WorkOrderDetailsComponent'
import WorkOrderList from './WorkOrderListComponent'
import WorkOrderCreate from './workOrderCreateComponent'
import IssueDetails from 'components/Issues/details'
import IssueList from 'components/Issues'
import _ from 'lodash'
const WorkOrders = () => {
  let match = useRouteMatch()

  let params = useRouteMatch('/issues/create/:type')
  let paramsDetail = useRouteMatch('/issues/details/:workOrderId')
  return (
    <div style={{ background: '#fff' }}>
      <Switch>
        <Route exact path={`${match.path}/details/:workOrderId`}>
          <IssueDetails issueId={_.get(paramsDetail, ['params', 'workOrderId'], '')} parameters={_.get(paramsDetail, ['params'], {})} />
        </Route>
        <Route exact path={`${match.path}/create/:type`}>
          <WorkOrderCreate parameters={_.get(params, ['params'], {})} />
        </Route>
        <Route exact path={match.path}>
          <IssueList />
        </Route>
        <Redirect to={match.path} />
      </Switch>
    </div>
  )
}

export default WorkOrders
