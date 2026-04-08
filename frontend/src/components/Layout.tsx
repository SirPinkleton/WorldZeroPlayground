import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="border-t-2 border-border mt-12 px-6 py-4 font-body text-xs text-muted flex gap-6 flex-wrap">
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
        <Link to="/disclaimer" className="hover:underline">Disclaimer</Link>
        <Link to="/attributions" className="hover:underline">Attributions</Link>
        <Link to="/donate" className="hover:underline">Donate</Link>
      </footer>
    </div>
  )
}
