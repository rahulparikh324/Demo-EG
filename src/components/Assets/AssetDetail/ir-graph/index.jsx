import React, { useEffect, useState } from 'react'

import getIRTests from 'Services/Asset/getIRTests'

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { AppBar } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import { getEndDate, timeRangeTypes, legend } from './utils'
import { snakifyKeys } from 'helpers/formatters'
import { getDateTime } from 'helpers/getDateTime'
import { get, isEmpty } from 'lodash'

const InsulationResistanceGraph = ({ assetId }) => {
  const pageSize = 0
  const pageIndex = 0
  const endDate = getEndDate()
  const theme = useTheme()
  const activeStyle = { background: theme.palette.primary.main, color: '#fff', padding: '4px 8px', borderRadius: '4px' }
  const nonActiveStyle = { background: 'none', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', borderWidth: '0 1px' }
  const [type, setType] = useState(timeRangeTypes.today)
  const [data, setData] = useState([])
  const [selectedTab, setTab] = useState('IR')
  //
  const getStartDate = () => {
    if (type === timeRangeTypes.all) return null
    if (type === timeRangeTypes.today) return `${endDate.split('T')[0]}T00:00:00`
    if (type === timeRangeTypes.week) return `${new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7).toISOString().split('T')[0]}T00:00:00`
    if (type === timeRangeTypes.month) return `${new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30).toISOString().split('T')[0]}T00:00:00`
  }
  //
  useEffect(() => {
    ;(async () => {
      try {
        const payload = { assetId, startDate: getStartDate(), endDate, pageSize, pageIndex }
        const data = await getIRTests(snakifyKeys(payload))
        const irData = []
        const list = get(data, 'data.list', [])
        list.forEach(d => {
          irData.push({
            ...d,
            irAcrossPoleAsFound1: d.irAcrossPoleAsFound1.slice(-1) < 10 ? Number(d.irAcrossPoleAsFound1) : Number(d.irAcrossPoleAsFound1.slice(0, -1)),
            irAcrossPoleAsFound2: d.irAcrossPoleAsFound2.slice(-1) < 10 ? Number(d.irAcrossPoleAsFound2) : Number(d.irAcrossPoleAsFound2.slice(0, -1)),
            irAcrossPoleAsFound3: d.irAcrossPoleAsFound3.slice(-1) < 10 ? Number(d.irAcrossPoleAsFound3) : Number(d.irAcrossPoleAsFound3.slice(0, -1)),
            irPoletoPoleAsFound1: d.irPoletoPoleAsFound1.slice(-1) < 10 ? Number(d.irPoletoPoleAsFound1) : Number(d.irPoletoPoleAsFound1.slice(0, -1)),
            irPoletoPoleAsFound2: d.irPoletoPoleAsFound2.slice(-1) < 10 ? Number(d.irPoletoPoleAsFound2) : Number(d.irPoletoPoleAsFound2.slice(0, -1)),
            irPoletoPoleAsFound3: d.irPoletoPoleAsFound3.slice(-1) < 10 ? Number(d.irPoletoPoleAsFound3) : Number(d.irPoletoPoleAsFound3.slice(0, -1)),
            timestamp: getDateTime(d.created_at),
          })
        })
        // console.log(irData)
        setData(irData)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [type])

  const CustomTick = props => {
    const { x, y, payload, index } = props
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={index === 0 ? 50 : 0} y='-8' dy={16} fontSize={10} textAnchor='end' fill='#000'>
          {payload.value.slice(0, 10)}
        </text>
        <text x={index === 0 ? 50 : 0} y={3} dy={16} fontSize={10} textAnchor='end' fill='#000'>
          {payload.value.slice(11)}
        </text>
      </g>
    )
  }

  const renderIRGraph = () => (
    <div style={{ padding: '12px', height: '85%' }}>
      <div className='d-flex flex-row justify-content-between align-items-center'>
        <div></div>
        <div className='d-flex flex-row align-items-center' style={{ fontWeight: 800, fontSize: '12px', cursor: 'pointer', border: '1px solid #eee', borderRadius: '4px' }}>
          <div style={type === timeRangeTypes.all ? activeStyle : nonActiveStyle} onClick={() => setType(timeRangeTypes.all)}>
            ALL
          </div>
          <div style={type === timeRangeTypes.today ? activeStyle : nonActiveStyle} onClick={() => setType(timeRangeTypes.today)}>
            TODAY
          </div>
          <div style={type === timeRangeTypes.week ? activeStyle : nonActiveStyle} onClick={() => setType(timeRangeTypes.week)}>
            LAST WEEK
          </div>
          <div style={type === timeRangeTypes.month ? activeStyle : nonActiveStyle} onClick={() => setType(timeRangeTypes.month)}>
            LAST MONTH
          </div>
        </div>
      </div>
      <div className='d-flex flex-row justify-content-between align-items-center' style={{ height: 'inherit' }}>
        {!isEmpty(data) ? (
          <>
            <ResponsiveContainer width='80%' height='80%'>
              <LineChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey='timestamp' interval={0} tick={<CustomTick />} />
                <YAxis />
                {legend.map(d => (
                  <Line key={d.dataKey} dataKey={d.dataKey} stroke={d.color} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className='d-flex flex-column justify-content-between align-items-center'>
              {legend.map(d => (
                <div key={d.dataKey} className='d-flex flex-row justify-content-center align-items-center' style={{ gap: '5px', fontWeight: 800, fontSize: '10px' }}>
                  <div style={{ background: d.color, borderRadius: '4px', width: '10px', height: '10px' }}></div>
                  <div>{d.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 800, color: 'gray' }}>No data found !</div>
        )}
      </div>
    </div>
  )

  const renderLoadProfile = () => (
    <div className='d-flex justify-content-center align-items-center' style={{ width: '100%', height: '90%', fontWeight: 800, color: 'gray' }}>
      No data found !
    </div>
  )

  return (
    <div style={{ width: '100%', height: '95%' }}>
      <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%', borderBottom: '1px solid #dee2e6' }}>
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={selectedTab} onSelect={k => setTab(k)}>
              <Tab eventKey='IR' title='Insulation Resistance Test' tabClassName='font-weight-bolder'></Tab>
              <Tab eventKey='PROFILE' title='Load Profile' tabClassName='font-weight-bolder'></Tab>
            </Tabs>
          </AppBar>
        </div>
      </div>
      {selectedTab === 'IR' && renderIRGraph()}
      {selectedTab === 'PROFILE' && renderLoadProfile()}
    </div>
  )
}

export default InsulationResistanceGraph
