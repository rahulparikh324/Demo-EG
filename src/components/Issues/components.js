import React from 'react'
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined'
import { generateAvatarColor } from './utlis'
import { get } from 'lodash'
import { handleNewRole } from 'helpers/handleNewRole'

export const CommentHeader = () => (
  <div className='d-flex' style={{ borderBottom: '1px solid #dee2e6', padding: '20px' }}>
    <ChatOutlinedIcon />
    <div className='text-bold ml-2'>Comments</div>
  </div>
)

const Avatar = ({ firstName, lastName }) => (
  <div style={{ width: '34px', height: '34px', padding: '8px', background: `${generateAvatarColor({ firstName, lastName })}26`, fontWeight: 800, textAlign: 'center', borderRadius: '4px', color: generateAvatarColor({ firstName, lastName }) }}>
    {firstName && firstName[0].toUpperCase()}
    {lastName && lastName[0].toUpperCase()}
  </div>
)

export const Comment = ({ data }) => {
  const [firstName, lastName] = get(data, 'commentUserName', []).split(' ')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '54px auto 20px', rowGap: '10px', padding: '16px' }}>
      <Avatar firstName={firstName} lastName={lastName} />
      <div>
        <div className='text-bold'>{get(data, 'commentUserName', '')}</div>
        <div className='text-bold' style={{ opacity: 0.75, fontSize: 10 }}>
          {handleNewRole(get(data, 'commentUserRoleName', 'NA'))}
        </div>
      </div>
      <div></div>
      <div></div>
      <div>{get(data, 'comment', 'NA')}</div>
      <div></div>
    </div>
  )
}
