import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bug Tracker',
  description: 'Plataforma de reporte de bugs',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-100`}>
        <Navbar />
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
