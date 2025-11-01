import { createContext, useContext } from 'react'

export const PageVisibilityContext = createContext(true)

export function usePageVisibility() {
  return useContext(PageVisibilityContext)
}
