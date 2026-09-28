import './globals.css'

export const metadata = {
  title: '__APP_NAME__',
  description: 'Generated Next.js app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">{children}</body>
    </html>
  )
}
