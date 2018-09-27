---
title: "Using third-party GraphQL APIs"
---

Gatsby v2 introduces a simple way to integrate any GraphQL API into Gatsby's GraphQL. You can integrate both third-party APIs, like Github's, APIs of services like GraphCMS or your custom GraphQL API.

## Basic example

First install the plugin.

```
npm install gatsby-source-graphql
```

Provided there is a GraphQL API under a `url`, adding it to an API just requires adding this to the config.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is the field under which it's accessible
        fieldName: "swapi",
        // URL to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
  ],
}
```

See all configuration options in the [plugin docs](/packages/gatsby-source-graphql)

Third-party APIs will be available under the `fieldName` specified, so you can query through it normally.

```graphql
{
  # Field name parameter defines how you can access a third-party API
  swapi {
    allSpecies {
      name
    }
  }
}
```

Note that types of the third-party API will be prefixed with `${typeName}_`. You need to prefix it too, eg when using variables or fragments.

```graphql
{
  # Field name parameter defines how you can access third-party API
  swapi {
    allSpecies {
      ... on SWAPI_Species {
        name
      }
    }
  }
}
```

## Creating pages dynamically through third-party APIs

You can also create pages dynamically by adding a `createPages` callback in `gatsby-node.js`. For example you can create a page for every Star Wars species.

```js
const path = require(`path`)

exports.createPages = async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query {
      swapi {
        allSpecies {
          id
          name
        }
      }
    }
  `)

  data.swapi.allSpecies.forEach(({ id, name }) => {
    actions.createPage({
      path: name,
      component: path.resolve(`./src/components/Species.js`),
      context: {
        speciesId: id,
      },
    })
  })
}
```

## Futher reading

- [graphql-source-graphql docs](/packages/gatsby-source-graphql)
- [Example with Github API](https://github.com/freiksenet/gatsby-github-displayer)
- [Example with GraphCMS](https://github.com/freiksenet/gatsby-graphcms)
