import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './app/Layout'
import { useAppInit } from './app/hooks'
import Landing from './features/landing/Landing.tsx'

const Browse = lazy(() => import('./features/browse/Browse.tsx'))
const Timeline = lazy(() => import('./features/timeline/Timeline.tsx'))
const SearchPage = lazy(() => import('./features/search/SearchPage.tsx'))
const EntryPage = lazy(() => import('./features/entry/EntryPage.tsx'))
const ImportsPage = lazy(() => import('./features/imports/ImportsPage.tsx'))
const BookmarksPage = lazy(() => import('./features/bookmarks/BookmarksPage.tsx'))
const StatsPage = lazy(() => import('./features/stats/StatsPage.tsx'))

const Loading = () => (
  <p className="p-12 text-center text-inksoft" role="status">
    正在调阅卷宗……
  </p>
)

export default function App() {
  useAppInit()
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/entry/:id" element={<EntryPage />} />
          <Route path="/imports" element={<ImportsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
