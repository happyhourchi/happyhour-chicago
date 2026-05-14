export const metadata = {
  title: 'Happy Hour Chicago',
  description: 'Find the best happy hour deals in Chicago',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
