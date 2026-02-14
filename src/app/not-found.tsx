import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          ページが見つかりません
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg transition-all duration-200"
          >
            ホームに戻る
          </Link>
          <Link
            href="/checkin"
            className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-secondary transition-all duration-200"
          >
            チェックインへ
          </Link>
        </div>
      </div>
    </div>
  );
}
