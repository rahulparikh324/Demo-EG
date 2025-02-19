import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import UserListComponent from './UserListComponent'
import CreateUserComponent from './CreateUserComponent'
import CreateNewUser from './CreateNewUser'
import UpdateUser from './UpdateUser'
import _ from 'lodash'

const Users = () => {
  let match = useRouteMatch()
  let params = useRouteMatch('/users/details/:userId')
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/create`}>
          <CreateUserComponent />
        </Route>
        <Route exact path={`${match.path}/createnew`}>
          <CreateNewUser />
        </Route>
        <Route exact path={`${match.path}/details/:userId`}>
          <UpdateUser userID={_.get(params, ['params', 'userId'], {})} />
        </Route>
        <Route exact path={match.path}>
          <UserListComponent />
        </Route>
        <Redirect to={match.path} />
      </Switch>
    </div>
  )
}

export default Users
