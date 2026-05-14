export const metadata = {
  title: 'Happy Hour Chicago',
  description: 'Find the best happy hour deals in Chicago',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0,padding:0,background:'#fafafa'}}>{children}</body>
    </html>
  )
}
