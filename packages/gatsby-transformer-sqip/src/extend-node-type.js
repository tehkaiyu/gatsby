const { resolve } = require(`path`)

const {
  DuotoneGradientType,
  ImageCropFocusType,
} = require(`gatsby-transformer-sharp/types`)
const { queueImageResizing } = require(`gatsby-plugin-sharp`)

const Debug = require(`debug`)
const fs = require(`fs-extra`)
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} = require(`gatsby/graphql`)
const sharp = require(`sharp`)
const { ensureDir } = require(`fs-extra`)

const generateSqip = require(`./generate-sqip`)

const debug = Debug(`gatsby-transformer-sqip`)
const SUPPORTED_NODES = [`ImageSharp`, `ContentfulAsset`]

module.exports = async args => {
  const {
    type: { name },
  } = args

  if (!SUPPORTED_NODES.includes(name)) {
    return {}
  }
  if (name === `ImageSharp`) {
    return sqipSharp(args)
  }

  if (name === `ContentfulAsset`) {
    return sqipContentful(args)
  }

  return {}
}

async function sqipSharp({ type, cache, getNodeAndSavePathDependency, store }) {
  const program = store.getState().program
  const cacheDir = resolve(`${program.directory}/.cache/sqip/`)

  await ensureDir(cacheDir)

  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `Sqip`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
        },
      }),
      args: {
        blur: { type: GraphQLInt, defaultValue: 1 },
        numberOfPrimitives: { type: GraphQLInt, defaultValue: 10 },
        mode: { type: GraphQLInt, defaultValue: 0 },
        width: {
          type: GraphQLInt,
          defaultValue: 256,
        },
        height: {
          type: GraphQLInt,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      async resolve(image, fieldArgs, context) {
        const {
          blur,
          numberOfPrimitives,
          mode,
          width,
          height,
          grayscale,
          duotone,
          cropFocus,
          rotate,
        } = fieldArgs

        const sharpArgs = {
          width,
          height,
          grayscale,
          duotone,
          cropFocus,
          rotate,
        }

        const file = getNodeAndSavePathDependency(image.parent, context.path)

        const job = await queueImageResizing({ file, args: sharpArgs })

        if (!(await fs.exists(job.absolutePath))) {
          debug(`Preparing ${file.name}`)
          await job.finishedPromise
        }

        const { absolutePath } = job

        return generateSqip({
          cache,
          cacheDir,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}

async function sqipContentful({ type, cache, store }) {
  const {
    schemes: { ImageResizingBehavior, ImageCropFocusType },
  } = require(`gatsby-source-contentful`)

  const cacheImage = require(`gatsby-source-contentful/cache-image`)

  const program = store.getState().program
  const cacheDir = resolve(`${program.directory}/.cache/sqip/`)

  await ensureDir(cacheDir)

  return {
    sqip: {
      type: new GraphQLObjectType({
        name: `Sqip`,
        fields: {
          svg: { type: GraphQLString },
          dataURI: { type: GraphQLString },
        },
      }),
      args: {
        blur: {
          type: GraphQLInt,
          defaultValue: 1,
        },
        numberOfPrimitives: {
          type: GraphQLInt,
          defaultValue: 10,
        },
        mode: {
          type: GraphQLInt,
          defaultValue: 0,
        },
        width: {
          type: GraphQLInt,
          defaultValue: 256,
        },
        height: {
          type: GraphQLInt,
        },
        resizingBehavior: {
          type: ImageResizingBehavior,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
        background: {
          type: GraphQLString,
          defaultValue: null,
        },
      },
      async resolve(asset, fieldArgs, context) {
        const {
          file: { contentType },
        } = asset

        if (contentType.indexOf(`image/`) !== 0) {
          return null
        }

        const {
          blur,
          numberOfPrimitives,
          mode,
          resizingBehavior,
          cropFocus,
          background,
        } = fieldArgs

        let { width, height } = fieldArgs

        if (width && height) {
          const aspectRatio = height / width
          width = 256
          height = height * aspectRatio
        }

        const options = {
          width: 256,
          height,
          resizingBehavior,
          cropFocus,
          background,
        }

        const absolutePath = await cacheImage(store, asset, options)

        return generateSqip({
          cache,
          cacheDir,
          absolutePath,
          numberOfPrimitives,
          blur,
          mode,
        })
      },
    },
  }
}
