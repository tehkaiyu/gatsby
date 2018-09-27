import React from "react"
import LaunchDemoIcon from "react-icons/lib/md/launch"
import GithubIcon from "react-icons/lib/go/mark-github"
import CopyToClipboardIcon from "react-icons/lib/go/clippy"
import MdStar from "react-icons/lib/md/star"
import { options } from "../../utils/typography"
import { colors } from "../../utils/presets"
import copyToClipboard from "../../utils/copy-to-clipboard"
import styles from "../shared/styles"
import ThumbnailLink from "../shared/thumbnail"
import EmptyGridItems from "../shared/empty-grid-items"

const ShowcaseList = ({ urlState, items, imgs, count, sortRecent }) => {
  if (!items.length) {
    // empty state!
    const emptyStateReason =
      urlState.s !== ``
        ? urlState.s // if theres a search term
        : urlState.d && !Array.isArray(urlState.d)
          ? urlState.d // if theres a single dependency
          : `matching` // if no search term or single dependency
    return (
      <div
        css={{
          display: `grid`,
          height: `80%`,
          alignItems: `center`,
          justifyContent: `center`,
          textAlign: `center`,
        }}
      >
        <h1>
          No {`${emptyStateReason}`} starters found!
          <div css={{ color: colors.gatsby }}>
            <small>
              Maybe you should write one and
              {` `}
              <a href="https://github.com/gatsbyjs/gatsby/issues/new?template=feature_request.md">
                submit it
              </a>
              ?
            </small>
          </div>
        </h1>
      </div>
    )
  }
  if (count) items = items.sort(sortingFunction(sortRecent)).slice(0, count)
  return (
    <div
      css={{
        fontFamily: options.headerFontFamily.join(`,`),
        ...styles.showcaseList,
      }}
    >
      {items.map(({ node }) => {
        const {
          githubData,
          description,
          stars,
          githubFullName,
          stub,
          gatsbyDependencies,
        } = node.fields.starterShowcase
        const gatsbyVersion = gatsbyDependencies.find(
          ([k, v]) => k === `gatsby`
        )[1]
        const match = gatsbyVersion.match(/([0-9]+)([.])([0-9]+)/) // we just want x.x
        const minorVersion = match ? match[0] : gatsbyVersion // default to version if no match
        const isGatsbyVersionWarning = !/(2..+|next|latest)/g.test(minorVersion) // either 2.x or next or latest
        const imgsharp = imgsFilter(imgs, stub)

        const repo = githubData.repoMetadata
        const { pushed_at } = repo
        return (
          node.fields && ( // have to filter out null fields from bad data
            <div
              key={node.id}
              css={{
                ...styles.showcaseItem,
              }}
              {...styles.withTitleHover}
            >
              <ThumbnailLink
                slug={`/starters/${stub}`}
                image={imgsharp}
                title={imgsharp.name}
              />
              <div
                css={{
                  ...styles.meta,
                }}
              >
                <div css={{ display: `flex`, justifyContent: `space-between` }}>
                  <span css={{ color: colors.gray.dark }}>
                    {repo.owner && repo.owner.login} /
                  </span>
                  <span>
                    <a
                      href="#copy-to-clipboard"
                      onClick={() =>
                        copyToClipboard(`https://github.com/${githubFullName}`)
                      }
                      css={{ ...styles.shortcutIcon }}
                    >
                      <CopyToClipboardIcon />
                    </a>
                    {` `}
                    <a
                      href={node.frontmatter.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      css={{ ...styles.shortcutIcon }}
                    >
                      <LaunchDemoIcon />
                    </a>
                    {` `}
                    <a
                      href={`https://github.com/${githubFullName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      css={{ ...styles.shortcutIcon }}
                    >
                      <GithubIcon />
                      {` `}
                    </a>
                  </span>
                </div>
                <div>
                  <span className="title">
                    <h5 css={{ margin: 0 }}>
                      <strong>{repo.name}</strong>
                    </h5>
                  </span>
                  {/* {isGatsbyVersionWarning ?
                      <span css={{ fontStyle: `italic`, color: `red` }}>Outdated Version: {minorVersion}</span> :
                      <span css={{ fontStyle: `italic`, color: `green` }}>Gatsby Version: {minorVersion}</span>
                    } */}
                </div>
                <div
                  css={{
                    textOverflow: `ellipsis`,
                    overflow: `hidden`,
                    whiteSpace: `nowrap`,
                  }}
                >
                  {description || `No description`}
                </div>
                <div css={{ display: `flex`, justifyContent: `space-between` }}>
                  <div css={{ display: `inline-block` }}>
                    <MdStar
                      style={{
                        color: colors.accent,
                        verticalAlign: `text-top`,
                      }}
                    />
                    {stars}
                  </div>
                  <div css={{ display: `inline-block` }}>
                    Updated {new Date(pushed_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )
        )
      })}
      {items.length && <EmptyGridItems styles={styles.showcaseItem} />}
    </div>
  )
}

export default ShowcaseList

function imgsFilter(imgs, stub) {
  const result = imgs.filter(img => img.node.name === stub)
  return result.length ? result[0].node : null
}

function sortingFunction(sortRecent) {
  return function({ node: nodeA }, { node: nodeB }) {
    const safewrap = obj =>
      sortRecent
        ? new Date(obj.githubData.repoMetadata.pushed_at)
        : obj[`stars`]
    const metricA = safewrap(nodeA.fields.starterShowcase)
    const metricB = safewrap(nodeB.fields.starterShowcase)
    return metricB - metricA
  }
}
