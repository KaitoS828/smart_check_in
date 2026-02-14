import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Smart Check-in</span>
          </div>
          <Link
            href="/admin"
            className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            管理者ログイン
          </Link>
        </nav>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              WebAuthn 生体認証対応
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              スマートな
              <span className="gradient-text"> セルフチェックイン</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              生体認証とSecret Codeによる二段階認証で、
              <br className="hidden sm:block" />
              安全でスムーズな無人チェックインを実現します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/checkin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl gradient-bg text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-pulse-glow"
              >
                チェックインする
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-border text-foreground font-semibold text-lg hover:bg-surface-secondary hover:-translate-y-0.5 transition-all duration-200"
              >
                管理者ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            3つのシンプルなステップ
          </h2>
          <p className="text-text-secondary text-lg">
            事前登録からチェックインまで、すべてスマートフォンで完結
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="group glass-card rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-sm font-semibold text-primary mb-2">STEP 1</div>
            <h3 className="text-xl font-bold text-foreground mb-3">事前登録</h3>
            <p className="text-text-secondary leading-relaxed">
              管理者から送られたURLにアクセスし、宿泊者情報と生体認証デバイスを登録します。
            </p>
          </div>

          {/* Step 2 */}
          <div className="group glass-card rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="text-sm font-semibold text-accent mb-2">STEP 2</div>
            <h3 className="text-xl font-bold text-foreground mb-3">生体認証</h3>
            <p className="text-text-secondary leading-relaxed">
              チェックイン時に指紋認証やFace IDで本人確認。パスワード入力は不要です。
            </p>
          </div>

          {/* Step 3 */}
          <div className="group glass-card rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚪</span>
            </div>
            <div className="text-sm font-semibold text-success mb-2">STEP 3</div>
            <h3 className="text-xl font-bold text-foreground mb-3">入室</h3>
            <p className="text-text-secondary leading-relaxed">
              Secret Codeを入力するとドア解錠PINが表示されます。チェックイン完了です。
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                最高水準の<span className="gradient-text">セキュリティ</span>
              </h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                FIDO2/WebAuthn準拠の生体認証とSecret Codeの二段階認証で、
                なりすましや不正アクセスを高いレベルで防止します。
              </p>
              <ul className="space-y-4">
                {[
                  { icon: '🛡️', text: 'FIDO2/WebAuthn準拠のパスキー認証' },
                  { icon: '🔑', text: '生体認証 + Secret Codeの二段階認証' },
                  { icon: '📱', text: 'Discoverable Credentialによるパスワードレス認証' },
                  { icon: '🔒', text: '認証情報はデバイスから外部に送信されません' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">認証成功</div>
                    <div className="text-sm text-text-secondary">Touch ID で確認済み</div>
                  </div>
                </div>
                <div className="bg-surface-secondary rounded-xl p-6 mb-4">
                  <div className="text-sm text-text-secondary mb-1">Secret Code</div>
                  <div className="text-2xl font-mono font-bold text-foreground tracking-widest">A7K-M3P-X9R</div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="text-sm text-primary font-medium mb-1">ドア解錠PIN</div>
                  <div className="text-4xl font-mono font-bold text-primary tracking-widest">1234</div>
                </div>
              </div>
              <div className="absolute -z-10 inset-0 gradient-bg opacity-10 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Smart Check-in</span>
            </div>
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} Smart Check-in. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
