import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'

const SelectWOAttachments = ({ open, onClose, columns, workOrderAttachments, afterSubmit }) => {
  const handleAction = async obj => {
    window.open(obj.file_url, '_blank')
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add Attachments to Report' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '16px', width: '48vw' }}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
          <TableComponent loading={false} columns={columns} data={workOrderAttachments} onRowClick={d => handleAction(d)} />
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' loading={false} disabled={false} onClick={afterSubmit} />
      </div>
    </Drawer>
  )
}

export default SelectWOAttachments
