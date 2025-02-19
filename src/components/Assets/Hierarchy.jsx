import React, { useState, useEffect } from 'react'
import getAssetsInHierarchy from '../../Services/Asset/getAssetsInHierarchy'
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table'
import { useTree, CellTree } from '@table-library/react-table-library/tree'
import KeyboardArrowRightOutlinedIcon from '@material-ui/icons/KeyboardArrowRightOutlined'
import KeyboardArrowDownOutlinedIcon from '@material-ui/icons/KeyboardArrowDownOutlined'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'
import Skeleton from '@material-ui/lab/Skeleton'
import TablePagination from '@material-ui/core/TablePagination'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import getUserRole from '../../helpers/getUserRole'
import { history } from '../../helpers/history'
import { useTheme } from '@table-library/react-table-library/theme'
import './assets.css'
import getSubComponents from '../../Services/Asset/getSubComponents.js'

const useStyles = makeStyles(theme => ({
  title: { fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' },
}))
const overRideStyles = {
  defaultHeader: { background: '#fafafa', fontWeight: 800, border: 0, fontSize: '14px', padding: '6px 24px 6px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)', lineHeight: '1.5rem' },
  defaultCell: { background: 'none', fontWeight: 400, border: 0, fontSize: '12px', padding: '6px 24px 6px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)', lineHeight: '1.5rem' },
}
function Rowx({ cols, item }) {
  return (
    <Row item={item}>
      {[...Array(cols)].map((x, index) => (
        <Cell key={index} style={{ ...overRideStyles.defaultCell, padding: '6px' }}>
          <Skeleton variant='text' animation='wave' height={19.5} style={{ marginLeft: '-20px' }} />
        </Cell>
      ))}
    </Row>
  )
}
function TableLoader({ cols, rows }) {
  const n = [...Array(20)].map(x => ({ id: x }))
  return (
    <Body>
      {n.map((x, index) => (
        <Rowx key={index} item={x} cols={cols} />
      ))}
    </Body>
  )
}

function Hierarchy() {
  const checkUserRole = new getUserRole()
  const classes = useStyles()
  const [data, setData] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [loadingIds, setLoadingIds] = useState([])
  const [fullfilledIDs, setFullFilledIDs] = useState([])
  //
  const findNodeById = (nodes, id) =>
    nodes.reduce((acc, value) => {
      if (acc) return acc
      if (value.id === id) return value
      if (value.nodes) return findNodeById(value.nodes, id)
      return acc
    }, null)
  //
  const needsToFetch = (nodes, id) => {
    const item = findNodeById(nodes, id)
    //console.log(item, item.nodes, item.nodes.length)
    return _.isEmpty(item.nodes)
  }
  //
  const search = (data, id) => {
    var f
    const s = (d, id) => {
      if (!d) return
      return d.find(x => (x.asset_id === id ? (f = x) : s(x.nodes, id)))
    }
    s(data, id)
    return f
  }
  const fetchChilds = async assetId => {
    try {
      const res = await getSubComponents(assetId, 0, 0)
      const tree = [...data]
      const node = search(tree, assetId)
      //console.log(node)
      node.nodes = res.data ? res.data.list.map(d => ({ ...d, id: d.asset_id, nodes: d.is_child_available ? [] : null })) : []
      //console.log('API response for', assetId)
      setData(tree)
      setFullFilledIDs([...fullfilledIDs, assetId])
      setLoadingIds(p => p.filter(id => id !== assetId))
    } catch (error) {
      console.log(error)
      setLoadingIds(loadingIds.filter(id => id !== assetId))
    }
  }
  //
  const onTreeChange = async (action, state) => {
    if (action.type !== 'ADD_BY_ID') return
    if (!needsToFetch(data, action.payload.id)) return
    setLoadingIds(loadingIds.concat(action.payload.id))
    await fetchChilds(action.payload.id)
  }
  const tree = useTree(
    { nodes: data },
    { onChange: onTreeChange },
    {
      treeIcon: {
        margin: '4px',
        noIconMargin: '26px',
        iconDefault: null,
        iconRight: <KeyboardArrowRightOutlinedIcon />,
        iconDown: <KeyboardArrowDownOutlinedIcon />,
      },
    }
  )
  const theme = useTheme({
    // &:nth-of-type(2),&:nth-of-type(4) {
    //   min-width: 10%;
    //   width: 10%;
    // }
    BaseCell:
      checkUserRole.isManager() || checkUserRole.isExecutive()
        ? `
      &:nth-of-type(1) {
        min-width: 60%;
        width: 60%;
      }
       &:nth-of-type(3) {
        min-width: 20%;
        width: 20%;
      }
      &:nth-of-type(2) {
        min-width: 20%;
        width: 20%;
      }
    `
        : `
    &:nth-of-type(1) {
      min-width: 70%;
      width: 70%;
    }
     &:nth-of-type(3) {
      min-width: 20%;
      width: 20%;
    }
    &:nth-of-type(2){
      min-width: 10%;
      width: 10%;
    }
  `,
  })
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const payload = {
          pagesize: rowsPerPage,
          pageindex: pageIndex,
          site_id: [],
          status: 1,
          asset_id: [],
          internal_asset_id: [],
          model_name: [],
          model_year: [],
          show_open_issues: 0,
          search_string: '',
          company_id: [],
        }
        const res = await getAssetsInHierarchy(payload)
        // console.log(res.data.list)
        setSize(res.data.listsize)
        const x = res.data.list.map(d => ({ ...d, id: d.asset_id, nodes: d.is_child_available ? [] : null }))
        setData(x)
        setLoading(false)
      } catch (error) {
        setData([])
        setLoading(false)
      }
    })()
  }, [rowsPerPage, pageIndex])
  //
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const handleSearchOnKeyDown = e => {
    setPage(0)
    setPageIndex(1)
    setSearchString(searchStringValue)
  }
  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
    setPage(0)
    setPageIndex(1)
  }
  // const viewDetails = id => history.push({ pathname: `assets/details/${id}` })
  //console.log(data, tree, loading)
  //

  const handleRowClick = id => {
    if (checkUserRole.isManager() || checkUserRole.isExecutive()) {
      history.push({ pathname: `assets/details/${id}` })
    }
  }
  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <Table data={{ nodes: data }} tree={tree} theme={theme} layout={{ custom: true }}>
        {tableList => (
          <>
            {!loading && (
              <Header>
                <HeaderRow>
                  <HeaderCell style={overRideStyles.defaultHeader}>Asset Name</HeaderCell>
                  <HeaderCell style={overRideStyles.defaultHeader}>Level</HeaderCell>
                  <HeaderCell style={overRideStyles.defaultHeader}>Facility</HeaderCell>
                  {/* {(checkUserRole.isManager() || checkUserRole.isExecutive()) && <HeaderCell style={overRideStyles.defaultHeader}>Action</HeaderCell>} */}
                </HeaderRow>
              </Header>
            )}
            {loading ? (
              <TableLoader cols={3} />
            ) : _.isEmpty(data) ? (
              <div className='Pendingtbl-no-datafound d-flex align-items-center justify-content-center'>No data found</div>
            ) : (
              <Body>
                <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '700px', height: '700px' }}>
                  {tableList.map(item => {
                    const showLoading = loadingIds.includes(item.id)
                    return (
                      <React.Fragment key={item.asset_id}>
                        <Row item={item} onClick={() => handleRowClick(item.asset_id)} className='table-with-row-click'>
                          <CellTree item={item} style={overRideStyles.defaultCell}>
                            {item.name}
                          </CellTree>
                          <Cell style={overRideStyles.defaultCell}>{item.levels}</Cell>
                          <Cell style={overRideStyles.defaultCell}>{item.site_name}</Cell>
                          {/* {(checkUserRole.isManager() || checkUserRole.isExecutive()) && (
                            <Cell style={overRideStyles.defaultCell}>
                              <Tooltip title='View' placement='top'>
                                <IconButton size='small' onClick={() => viewDetails(item.asset_id)}>
                                  <VisibilityOutlinedIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </Cell>
                          )} */}
                        </Row>
                        {showLoading && <div style={{ marginLeft: `${64 + item.treeXLevel * 20}px`, fontSize: '12px', fontWeight: 800, padding: '9px 0' }}>Loading ...</div>}
                      </React.Fragment>
                    )
                  })}
                </div>
              </Body>
            )}
          </>
        )}
      </Table>
      {!_.isEmpty(data) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
    </div>
  )
}

export default Hierarchy
