const parseXml = require(`xml-parser`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

async function onCreateNode({ node, actions, loadNodeContent, createNodeId }) {
  const { createNode, createParentChildLink } = actions

  // We only care about XML content.
  if (![`application/xml`, `text/xml`].includes(node.internal.mediaType)) {
    return
  }
  const rawXml = await loadNodeContent(node)
  const parsedXml = parseXml(rawXml)
  const nodeArray = parsedXml.root.children.map((obj, i) => {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)
    if (obj.children) {
      obj.xmlChildren = obj.children
      delete obj.children
    }
    return {
      ...obj,
      id: obj.attributes.id
        ? obj.attributes.id
        : createNodeId(`${node.id} [${i}] >>> XML`),
      parent: node.id,
      children: [],
      internal: {
        contentDigest,
        type: _.upperFirst(_.camelCase(`${node.name} xml`)),
      },
    }
  })

  _.each(nodeArray, j => {
    createNode(j)
    createParentChildLink({ parent: node, child: j })
  })
  return
}

exports.onCreateNode = onCreateNode
