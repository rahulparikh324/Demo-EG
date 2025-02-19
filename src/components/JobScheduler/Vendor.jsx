import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import _ from 'lodash'

import VendorDetail from './VendorDetail'
import VendorList from './VendorList'

const Vendor = () => {
  let match = useRouteMatch()
  let params = useRouteMatch('/vendors/details/:vendorId')

  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/details/:vendorId`}>
          <VendorDetail vendorId={_.get(params, ['params', 'vendorId'])} />
        </Route>
        <Route exact path={match.path}>
          <VendorList />
        </Route>
        <Redirect to={match.path} />
      </Switch>
    </div>
  )
}

export default Vendor
