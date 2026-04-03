import type { ReactNode } from 'react'
import NavBar from './NavBar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="border-t-2 border-border mt-12 px-6 py-4 font-body text-xs text-muted flex gap-6 flex-wrap">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Contact</a>
        <a href="#" className="hover:underline">Disclaimer</a>
        <a href="#" className="hover:underline">Attributions</a>
        <a href="#" className="hover:underline">Donate</a>
      </footer>
    </div>
  )
}
