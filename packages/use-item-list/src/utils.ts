function scroller(node) {
  if (node === document.body) {
    return {
      offsetTop: 0,
      scrollY: window.pageYOffset,
      height: window.innerHeight,
      setPosition: top => window.scrollTo(0, top),
    }
  } else {
    return {
      offsetTop: node.getBoundingClientRect().top,
      scrollY: node.scrollTop,
      height: node.offsetHeight,
      setPosition: top => (node.scrollTop = top),
    }
  }
}

/**
 * Get the closest element that scrolls
 * @param {HTMLElement} node - the child element to start searching for scroll parent at
 * @param {HTMLElement} rootNode - the root element of the component
 * @return {HTMLElement} the closest parentNode that scrolls
 */
export function getClosestScrollParent(node) {
  if (node !== null) {
    if (node === document.body || node.scrollHeight > node.clientHeight) {
      return scroller(node)
    } else {
      return getClosestScrollParent(node.parentNode)
    }
  } else {
    return null
  }
}

/**
 * Scroll node into view if necessary
 * @param {HTMLElement} node - the element that should scroll into view
 * @param {HTMLElement} rootNode - the root element of the component
 * @param {Boolean} alignToTop - align element to the top of the visible area of the scrollable ancestor
 */
export function scrollIntoView(node) {
  const scrollParent = getClosestScrollParent(node)
  if (scrollParent === null) {
    return
  }
  const nodeRect = node.getBoundingClientRect()
  const nodeTop = scrollParent.scrollY + (nodeRect.top - scrollParent.offsetTop)
  if (nodeTop < scrollParent.scrollY) {
    // the item is above the scrollable area
    scrollParent.setPosition(nodeTop)
  } else if (
    nodeTop + nodeRect.height >
    scrollParent.scrollY + scrollParent.height
  ) {
    // the item is below the scrollable area
    scrollParent.setPosition(nodeTop + nodeRect.height - scrollParent.height)
  }
}
