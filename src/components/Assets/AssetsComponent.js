import React from 'react'
import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import AssetDetail from './AssetDetail/AssetDetail'
//import AssetDetail from './AssetDetail/asset-detail'
import AssetList from './AssetListComponent'
import AssetListEEE from './AssetListEEE'
import UploadAsset from './UploadAsset'
import AddInspection from './AssetDetail/AddInspection'
import _ from 'lodash'

const Assets = () => {
  let match = useRouteMatch()
  var logindata = localStorage.getItem('loginData')
  logindata = JSON.parse(logindata)
  let params = useRouteMatch('/assets/details/:assetId')
  let params2 = useRouteMatch('/assets/perform-checklist/:assetId')

  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/details/:assetId`}>
          <AssetDetail assetId={_.get(params, ['params', 'assetId'])} />
        </Route>
        <Route exact path={`${match.path}/perform-checklist/:assetId`}>
          <AddInspection assetId={_.get(params2, ['params', 'assetId'])} />
        </Route>
        <Route exact path={`${match.path}/upload`}>
          <UploadAsset />
        </Route>
        <Route exact path={match.path}>
          <AssetListEEE assetId={_.get(params, ['params', 'assetId'])} />
        </Route>
        <Redirect to={match.path} />
      </Switch>
    </div>
  )
}

export default Assets
