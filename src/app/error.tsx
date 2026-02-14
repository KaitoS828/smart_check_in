'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          エラーが発生しました
        </h1>
        <p className="text-text-secondary mb-6 leading-relaxed">
          {error.message || '予期しないエラーが発生しました。もう一度お試しください。'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg transition-all duration-200"
          >
            もう一度試す
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-secondary transition-all duration-200"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
