import _ from 'lodash'

const makeTree = nodes => {
  const nodeOccurances = []
  const backLinks = []
  const findChildren = node => {
    if (node.is_child_available) {
      const childrenIDs = node.children_list.map(d => d.children_asset_id)
      const filteredNodes = nodes.filter(d => childrenIDs.includes(d.asset_id))
      const childrenNodes = []
      filteredNodes.forEach(d => {
        if (!nodeOccurances.includes(d.asset_id)) {
          nodeOccurances.push(d.asset_id)
          childrenNodes.push(d)
        } else backLinks.push({ source: node.asset_id, target: d.asset_id })
      })
      // if (!_.isEmpty(node.subcomponent_list)) {
      //   //add subcomponent as part of top level asset heirarchy and children if connected with main ocp
      //   const subComponentNodes = node.subcomponent_list
      //   subComponentNodes.forEach(subComponent => {
      //     const filteredNodes = childrenNodes.filter(d => node.children_list.some(o => o.children_asset_id === d.asset_id && o.ocp_main_subcomponent_asset === subComponent.asset_id))
      //     if (!_.isEmpty(filteredNodes)) {
      //       subComponent.children = subComponent.children ? [...subComponent.children, ...filteredNodes] : [...filteredNodes]
      //       //remove from children as added to subcomponent children
      //       filteredNodes.forEach(nodeToRemove => {
      //         const index = childrenNodes.indexOf(nodeToRemove)
      //         if (index !== -1) {
      //           childrenNodes.splice(index, 1) // Remove the node from childrenNodes
      //         }
      //       })
      //     }
      //   })
      //   childrenNodes.push(...subComponentNodes.map(item => ({ ...item, is_subcomponent: true })))
      // }
      node.children = childrenNodes.length ? childrenNodes : null
    }
    //  else if (!_.isEmpty(node.subcomponent_list)) {
    //   const subComponentNodes = node.subcomponent_list
    //   const childrenNodes = [...subComponentNodes.map(item => ({ ...item, is_subcomponent: true }))]
    //   node.children = childrenNodes
    // }
    else node.children = null
  }
  nodes.forEach(node => findChildren(node))
  const data = nodes.filter(d => !nodeOccurances.includes(d.asset_id))
  return { nodes: data, backLinks }
}
export default makeTree
