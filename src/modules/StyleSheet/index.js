import { resetCSS, predefinedCSS, predefinedClassNames } from './predefs'
import getStyleObjects from './getStyleObjects'
import prefixer from './prefixer'
import Store from './Store'

/**
 * Initialize the store with pointer-event styles mapping to our custom pointer
 * event classes
 */
const initialState = { classNames: predefinedClassNames }
const options = { obfuscateClassNames: process.env.NODE_ENV === 'production' }
const createStore = () => new Store(initialState, options)
let store = createStore()

/**
 * Process all unique declarations
 */
const create = (styles: Object): Object => {
  const rules = getStyleObjects(styles)
  rules.forEach((rule) => {
    Object.keys(rule).forEach(property => {
      const value = rule[property]
      // add each declaration to the store
      store.set(property, value)
    })
  })
  return styles
}

/**
 * Destroy existing styles
 */
const destroy = () => {
  store = createStore()
}

/**
 * Render the styles as a CSS style sheet
 */
const renderToString = () => {
  const css = store.toString()
  return `${resetCSS}\n${predefinedCSS}\n${css}`
}

const merge = (style) => {
  const reducer = (acc, styles) => {
    if (!styles) { return acc }

    if (!(styles instanceof Array)) {
      return { ...acc, ...styles }
    }

    return styles.reduce(reducer, acc)
  }
  return [style].reduce(reducer, {})
}

/**
 * Accepts React props and converts inline styles to single purpose classes
 * where possible.
 */
const resolve = ({ className = '', style = {} }) => {
  let _className
  let _style = {}

  const classList = [ className ]

  const combinedStyle = merge(style)

  for (const prop in combinedStyle) {
    let styleClass = store.get(prop, combinedStyle[prop])

    if (styleClass) {
      classList.push(styleClass)
    } else {
      _style[prop] = combinedStyle[prop]
    }
  }

  _className = classList.join(' ')
  _style = prefixer.prefix(_style)

  return { className: _className, style: _style }
}

export default {
  create,
  destroy,
  renderToString,
  resolve,
  merge,
}
