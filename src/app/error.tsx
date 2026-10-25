'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-3xl font-semibold text-brand-800">Something went wrong</h1>
      <p className="max-w-md text-ink/70">
        The page could not be loaded. Please try again. If this keeps happening, check that your Supabase keys are set
        correctly.
      </p>
      <button onClick={() => reset()} className="btn btn-primary">
        Try again
      </button>
    </main>
  );
}
