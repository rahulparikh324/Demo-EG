import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const equipments = {
  getAllEquipmentList: payload => api(`${URL.equipments.getAllEquipmentList}`, payload, true),
  addUpdateEquipment: payload => api(`${URL.equipments.addUpdateEquipment}`, payload, true),
  deleteEquipment: id => api(`${URL.equipments.deleteEquipment}?equipmentId=${id}`, '', true),
  filterAttributesEquipment: () => api(`${URL.equipments.filterAttributesEquipment}`),
}

export default equipments
