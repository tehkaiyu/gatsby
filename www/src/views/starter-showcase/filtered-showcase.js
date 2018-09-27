import React, { Component } from "react"
import SearchIcon from "../../components/search-icon"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import MdSort from "react-icons/lib/md/sort"

import { options, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

import styles from "../shared/styles"

import LHSFilter from "./lhs-filter"
import ShowcaseList from "./showcase-list"
import Button from "../../components/button"
import {
  SidebarHeader,
  SidebarBody,
  SidebarContainer,
  ContentHeader,
  ContentTitle,
  ContentContainer,
} from "../shared/sidebar"
import ResetFilters from "../shared/reset-filters"

export default class FilteredShowcase extends Component {
  state = {
    sitesToShow: 9,
  }
  setFiltersCategory = filtersCategory =>
    this.props.setURLState({ c: Array.from(filtersCategory) })
  setFiltersDependency = filtersDependency =>
    this.props.setURLState({ d: Array.from(filtersDependency) })
  toggleSort = () =>
    this.props.setURLState({
      sort: this.props.urlState.sort === `recent` ? `stars` : `recent`,
    })
  resetFilters = () => this.props.setURLState({ c: null, d: null, s: `` })

  render() {
    const { data, urlState, setURLState } = this.props
    const {
      setFiltersCategory,
      setFiltersDependency,
      resetFilters,
      toggleSort,
    } = this
    const filtersCategory = new Set(
      Array.isArray(urlState.c) ? urlState.c : [urlState.c]
    )
    const filtersDependency = new Set(
      Array.isArray(urlState.d) ? urlState.d : [urlState.d]
    )
    // https://stackoverflow.com/a/32001444/1106414
    const filters = new Set(
      [].concat(
        ...[filtersCategory, filtersDependency].map(set => Array.from(set))
      )
    )

    let items = data.allMarkdownRemark.edges,
      imgs = data.allFile.edges

    if (urlState.s.length > 0) {
      items = items.filter(node => {
        // TODO: SWYX: very very simple object search algorithm, i know, sorry
        const { fields, frontmatter } = node.node
        if (fields) frontmatter.fields = fields.starterShowcase
        return JSON.stringify(frontmatter)
          .toLowerCase()
          .includes(urlState.s)
      })
    }

    if (filtersCategory.size > 0) {
      items = filterByCategories(items, filtersCategory)
    }
    if (filtersDependency.size > 0) {
      items = filterByDependencies(items, filtersDependency)
    }

    return (
      <section className="showcase" css={{ display: `flex` }}>
        <SidebarContainer>
          <SidebarHeader />
          <SidebarBody>
            {(filters.size > 0 || urlState.s.length > 0) && ( // search is a filter too https://gatsbyjs.slack.com/archives/CB4V648ET/p1529224551000008
              <ResetFilters onClick={resetFilters} />
            )}
            <LHSFilter
              heading="Categories"
              data={Array.from(
                count(
                  items.map(
                    ({ node }) => node.frontmatter && node.frontmatter.tags
                  )
                )
              )}
              filters={filtersCategory}
              setFilters={setFiltersCategory}
              sortRecent={urlState.sort === `recent`}
            />
            <LHSFilter
              heading="Gatsby Dependencies"
              data={Array.from(
                count(
                  items.map(
                    ({ node }) =>
                      node.fields &&
                      node.fields.starterShowcase.gatsbyDependencies.map(
                        str => str[0]
                      )
                  )
                )
              )}
              filters={filtersDependency}
              setFilters={setFiltersDependency}
              sortRecent={urlState.sort === `recent`}
            />
          </SidebarBody>
        </SidebarContainer>
        <ContentContainer>
          <ContentHeader>
            <ContentTitle
              search={urlState.s}
              filters={filters}
              label="Gatsby Starter"
              items={items}
              edges={data.allMarkdownRemark.edges}
              what="size"
            />
            <div css={{ marginLeft: `auto` }}>
              <label
                css={{
                  display: `none`,
                  [presets.Desktop]: {
                    color: colors.gatsby,
                    border: 0,
                    borderRadius: presets.radiusLg,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    width: rhythm(5),
                  },
                }}
                onClick={toggleSort}
              >
                <MdSort css={{ marginRight: 8 }} />
                {urlState.sort === `recent` ? `Most recent` : `Most stars`}
              </label>
              <label css={{ position: `relative` }}>
                <input
                  css={{
                    border: 0,
                    borderRadius: presets.radiusLg,
                    color: colors.gatsby,
                    fontFamily: options.headerFontFamily.join(`,`),
                    paddingTop: rhythm(1 / 8),
                    paddingRight: rhythm(1 / 5),
                    paddingBottom: rhythm(1 / 8),
                    paddingLeft: rhythm(1),
                    width: rhythm(5),
                    ":focus": {
                      outline: 0,
                      backgroundColor: colors.ui.light,
                      borderRadius: presets.radiusLg,
                      transition: `width ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }, background-color ${presets.animation.speedDefault} ${
                        presets.animation.curveDefault
                      }`,
                    },
                  }}
                  type="text"
                  value={urlState.s}
                  // TODO: SWYX: i know this is spammy, we can finetune history vs search later
                  onChange={e => setURLState({ s: e.target.value })}
                  placeholder="Search sites"
                  aria-label="Search sites"
                />
                <SearchIcon
                  overrideCSS={{
                    fill: colors.lilac,
                    position: `absolute`,
                    left: `5px`,
                    top: `50%`,
                    width: `16px`,
                    height: `16px`,
                    pointerEvents: `none`,
                    transform: `translateY(-50%)`,
                  }}
                />
              </label>
            </div>
          </ContentHeader>
          <ShowcaseList
            urlState={urlState}
            sortRecent={urlState.sort === `recent`}
            items={items}
            imgs={imgs}
            count={this.state.sitesToShow}
          />
          {this.state.sitesToShow < items.length && (
            <Button
              tag="button"
              overrideCSS={styles.loadMoreButton}
              onClick={() => {
                this.setState({ sitesToShow: this.state.sitesToShow + 15 })
              }}
              icon={<MdArrowDownward />}
            >
              Load More
            </Button>
          )}
        </ContentContainer>
      </section>
    )
  }
}

// utility functions

function count(arrays) {
  let counts = new Map()

  for (let categories of arrays) {
    if (!categories) continue

    for (let category of categories) {
      if (!counts.has(category)) {
        counts.set(category, 0)
      }

      counts.set(category, counts.get(category) + 1)
    }
  }

  return counts
}

function filterByCategories(list, categories) {
  let items = list
  items = items.filter(
    ({ node }) =>
      node.frontmatter && isSuperset(node.frontmatter.tags, categories)
  )
  return items
}
function filterByDependencies(list, categories) {
  let items = list

  items = items.filter(
    ({ node }) =>
      node.fields &&
      isSuperset(
        node.fields.starterShowcase.gatsbyDependencies.map(c => c[0]),
        categories
      )
    // node.fields.starterShowcase.gatsbyDependencies.filter(c => categories.has(c[0])).length > 0
  )

  return items
}

function isSuperset(set, subset) {
  for (var elem of subset) {
    if (!set.includes(elem)) {
      return false
    }
  }
  return true
}
