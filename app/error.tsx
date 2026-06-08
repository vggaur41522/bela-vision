'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 flex-col">
      <h1 className="text-2xl font-bold mb-4">500 - Server Error</h1>
      <pre className="text-sm text-red-400 mb-4">{error.message}</pre>
      <button onClick={() => reset()} className="px-4 py-2 bg-indigo-600 rounded">Try again</button>
    </div>
  );
}
