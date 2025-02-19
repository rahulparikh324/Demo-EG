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
      node.children = childrenNodes.length ? childrenNodes : null
    } else node.children = null
  }
  nodes.forEach(node => findChildren(node))
  const data = nodes.filter(d => !nodeOccurances.includes(d.asset_id))
  return { nodes: data, backLinks }
}
export default makeTree
