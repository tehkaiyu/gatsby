import React from "react"
import { graphql } from "gatsby"

import Layout from "../layouts"

class Article extends React.Component {
  render() {
    return (
      <Layout>
        <div
          dangerouslySetInnerHTML={{ __html: this.props.data.asciidoc.html }}
        />
      </Layout>
    )
  }
}

export default Article

export const pageQuery = graphql`
  query($id: String!) {
    asciidoc(id: { eq: $id }) {
      html
    }
  }
`
