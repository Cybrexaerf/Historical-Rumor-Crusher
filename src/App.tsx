import { Route, Routes } from 'react-router-dom'
import Layout from './app/Layout'
import { useAppInit } from './app/hooks'
import Landing from './features/landing/Landing.tsx'
import Browse from './features/browse/Browse.tsx'

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{name}</h1>
    <p className="mt-2 text-inksoft">待实现</p>
  </div>
)

export default function App() {
  useAppInit()
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/timeline" element={<Placeholder name="时代长卷" />} />
        <Route path="/entry/:id" element={<Placeholder name="卷宗" />} />
        <Route path="/search" element={<Placeholder name="检索" />} />
        <Route path="/imports" element={<Placeholder name="导入管理" />} />
        <Route path="/bookmarks" element={<Placeholder name="我的书架" />} />
      </Route>
    </Routes>
  )
}
