import React from "react"
import presets, { colors } from "../utils/presets"
import { rhythm } from "../utils/typography"
import { vP, vPHd, vPVHd } from "../components/gutters"

const Card = ({ children }) => (
  <div
    css={{
      boxSizing: `border-box`,
      display: `flex`,
      transform: `translateZ(0)`,
      [presets.Tablet]: {
        flex: `0 0 auto`,
        maxWidth: `50%`,
        boxShadow: `0 1px 0 0 ${colors.ui.light}`,
        "&:nth-child(5),&:nth-child(6)": {
          boxShadow: `none`,
        },
        "&:nth-child(2n)": {
          borderLeft: `1px solid ${colors.ui.light}`,
        },
      },
      [presets.Hd]: {
        flex: `0 0 auto`,
        maxWidth: `33.33333333%`,
        borderLeft: `1px solid ${colors.ui.light}`,
        "&:nth-child(4)": {
          boxShadow: `none`,
        },
        "&:nth-child(3n+1)": {
          borderLeft: 0,
        },
      },
    }}
  >
    <div
      css={{
        padding: rhythm(presets.gutters.default / 2),
        paddingBottom: 0,
        transform: `translateZ(0)`,
        [presets.Mobile]: {
          padding: vP,
          paddingBottom: 0,
        },
        [presets.Phablet]: {
          padding: vP,
        },
        [presets.VHd]: {
          padding: vPHd,
        },
        [presets.VVHd]: {
          padding: vPVHd,
        },
      }}
    >
      {children}
    </div>
  </div>
)

export default Card
