import React, { useState } from 'react'
import Switch from 'react-switch'

export default function CustomSwitch() {
  const [checked, setchecked] = useState(false)
  return <Switch onChange={setchecked} offColor='#929292' onColor='#146481' height={20} width={30} checked={checked} checkedIcon={false} uncheckedIcon={false} />
}
