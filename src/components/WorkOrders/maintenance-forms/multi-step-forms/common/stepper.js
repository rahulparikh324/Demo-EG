import React from 'react'
import { useTheme } from '@material-ui/core/styles'

const Stepper = ({ steps = [], activeStep, setActiveStep }) => {
  const theme = useTheme()
  const Step = ({ step, no, name, isActive }) => (
    <div className='d-flex flex-column align-items-center stepper' style={{ zIndex: 3 }}>
      <div className='text-bold d-flex align-items-center justify-content-center text-xs' style={{ width: '24px', height: '24px', background: isActive ? theme.palette.primary.main : '#efefef', color: isActive ? '#fff' : '#7f7f7f', borderRadius: '12px' }}>
        {no}
      </div>
      <div className='text-bold text-xs mt-1' style={{ color: isActive ? theme.palette.primary.main : '#7f7f7f' }}>
        {name}
      </div>
    </div>
  )
  return (
    <div className='px-3 pt-3 pb-2 d-flex justify-content-between align-items-center' style={{ width: '100%', background: '#fff', borderRadius: '4px', position: 'relative' }}>
      {steps.map(d => (
        <Step key={d.id} step={d} no={d.id} name={d.name} isActive={activeStep.id >= d.id} />
      ))}
      <div className='d-flex' style={{ width: 'calc(100% - 100px)', height: '8px', position: 'absolute', top: '25px', left: '43px' }}>
        {[...Array(steps.length - 1)].map((d, index) => (
          <div key={index} style={{ background: activeStep.id >= index + 2 ? theme.palette.primary.main : `${theme.palette.primary.main}15`, width: `${100 / (steps.length - 1)}%` }}></div>
        ))}
      </div>
    </div>
  )
}

export default Stepper
