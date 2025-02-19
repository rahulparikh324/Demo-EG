import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import getUpComingPMs from '../../Services/Asset/upComingPMs'

function Barchart() {
  const [data, setData] = useState([])
  const [height, setHeight] = useState(300)
  useEffect(() => {
    // const handleResize = () => {
    //   //console.log(window.innerHeight)
    //   if (window.innerHeight < 920) setHeight(250)
    //   else setHeight(300)
    // }
    ;(async () => {
      try {
        const PMS = await getUpComingPMs()
        const pms = PMS.upcomingPMs.map(pm => {
          const startDate = new Date(pm.start_date).toDateString().split(' ')
          const endDate = new Date(pm.end_date).toDateString().split(' ')
          return { count: pm.pmCount, date: `${startDate[1]} ${startDate[2]} - ${endDate[1]} ${endDate[2]}` }
        })
        //if (window.innerHeight < 920) setHeight(250)
        //console.log(pms)
        setData(pms)
      } catch (error) {
        setData([])
      }
      // window.addEventListener('resize', handleResize)
      // return () => window.removeEventListener('resize', handleResize)
    })()
  }, [])
  return (
    <div style={{ width: '100%', height: '95%', padding: '20px' }}>
      <div className='d-flex flex-row justify-content-between align-items-center'>
        <span className='graph-title py-0'>Upcoming PMs</span>
      </div>
      <ResponsiveContainer height={height}>
        <BarChart data={data} margin={{ top: 35, right: 30, left: 10, bottom: 5 }}>
          <XAxis dataKey='date' />
          <YAxis />
          <Bar dataKey='count' fill='#4682B4' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Barchart
