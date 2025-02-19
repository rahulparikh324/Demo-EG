import React from 'react'
import { useRouteMatch, Switch, Route } from 'react-router-dom'

import QuoteTabs from './quote-tabs'
import OnBoardingWorkOrder from 'components/WorkOrders/onboarding'
import AcceptanceTWO from 'components/WorkOrders/AcceptanceTWO'

import { get } from 'lodash'

const Quotes = () => {
  let match = useRouteMatch()
  const params = useRouteMatch('/quote/maintenance/:id')
  const params1 = useRouteMatch('/quote/infrared-thermography/:id')
  const params2 = useRouteMatch('/quote/audit/:id')
  return (
    <Switch>
      <Route exact path={match.path}>
        <QuoteTabs />
      </Route>
      <Route exact path={`${match.path}/maintenance/:id`}>
        <AcceptanceTWO workOrderID={get(params, ['params', 'id'])} isQuote />
      </Route>
      <Route exact path={`${match.path}/infrared-thermography/:id`}>
        <OnBoardingWorkOrder workOrderID={get(params1, ['params', 'id'])} isQuote />
      </Route>
      <Route exact path={`${match.path}/audit/:id`}>
        <OnBoardingWorkOrder workOrderID={get(params2, ['params', 'id'])} isQuote />
      </Route>
    </Switch>
  )
}

export default Quotes
