// Chrome-free full-screen chart route — embedded by the mobile app's WebView.
export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#ffffff' }}>
      {children}
    </div>
  );
}
