import React from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import './maintainance.css'

function DonutChart() {
  const data = [
    { name: 'Completed', value: 15 },
    { name: 'In Progress', value: 7 },
    { name: 'Cancelled', value: 4 },
  ]
  const total = 26
  const COLORS = ['#00C49F', '#ff7e28', '#fe0000']
  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
        {`${Math.ceil(percent * total).toFixed(0)}`}
      </text>
    )
  }

  return (
    <div style={{ width: '100%', height: '90%', padding: '20px' }}>
      <span className='graph-title'>Upcoming Tasks </span>
      <ResponsiveContainer height={300}>
        <PieChart margin={{ left: 40 }}>
          <Pie data={data} cx={120} cy={180} label={renderCustomizedLabel} innerRadius={80} outerRadius={120} fill='#8884d8' paddingAngle={5} dataKey='value'>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend verticalAlign='top' align='right' layout='vertical' />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DonutChart
