import { Route, Routes } from 'react-router-dom'
import Layout from './app/Layout'
import { useAppInit } from './app/hooks'
import Landing from './features/landing/Landing.tsx'
import Browse from './features/browse/Browse.tsx'
import Timeline from './features/timeline/Timeline.tsx'
import SearchPage from './features/search/SearchPage.tsx'
import EntryPage from './features/entry/EntryPage.tsx'
import ImportsPage from './features/imports/ImportsPage.tsx'
import BookmarksPage from './features/bookmarks/BookmarksPage.tsx'

export default function App() {
  useAppInit()
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/entry/:id" element={<EntryPage />} />
        <Route path="/imports" element={<ImportsPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
      </Route>
    </Routes>
  )
}
