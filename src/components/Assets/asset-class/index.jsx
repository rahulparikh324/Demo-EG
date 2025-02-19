import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'

import ClassList from 'components/Assets/asset-class/class-list'
import ClassDetails from 'components/Assets/asset-class/class-details'
import { get } from 'lodash'

const AssetClass = () => {
  const { path } = useRouteMatch()
  const params = useRouteMatch('/asset-classes/:classId')
  return (
    <Switch>
      <Route exact path={`${path}/:classId`}>
        <ClassDetails classId={get(params, ['params', 'classId'])} />
      </Route>
      <Route exact path={path}>
        <ClassList />
      </Route>
      <Redirect to={path} />
    </Switch>
  )
}

export default AssetClass
