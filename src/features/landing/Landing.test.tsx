import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { useArchive } from '../../content/store.ts'
import Landing from './Landing.tsx'

describe('Landing + store integration', () => {
  beforeEach(async () => {
    await useArchive.getState().init()
  })

  it('shows real stats computed from manifest', async () => {
    render(
      <HashRouter>
        <Landing />
      </HashRouter>
    )
    await waitFor(() => {
      expect(useArchive.getState().ready).toBe(true)
    })
    const total = useArchive.getState().merged.stats.total
    expect(total).toBeGreaterThanOrEqual(6)
    expect(screen.getByText(new RegExp(`收录网络流传的历史类谣言\\s*${total}\\s*条`))).toBeTruthy()
    expect(screen.getByText('证伪')).toBeTruthy()
  })

  it('renders recent dossier cards linking to entries', async () => {
    render(
      <HashRouter>
        <Landing />
      </HashRouter>
    )
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /乾隆|焚书|木牛|郑和|杨贵妃|烛影/ }).length).toBeGreaterThan(0)
    })
  })
})
