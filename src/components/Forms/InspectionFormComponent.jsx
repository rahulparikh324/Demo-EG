import React from 'react'
import { useRouteMatch, Switch, Route } from 'react-router-dom'
import InspectionForm from './InspectionForm'
import FormList from './FormList'

function InspectionFormComponent() {
  const match = useRouteMatch()
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/create`}>
          <InspectionForm />
        </Route>
        <Route exact path={match.path}>
          <FormList />
        </Route>
      </Switch>
    </div>
  )
}

export default InspectionFormComponent
