import Link from 'next/link';
import PoetForm from '@/components/admin/PoetForm';

export default function NewPoet() {
  return (
    <div className="space-y-6">
      <Link href="/admin/poets" className="text-sm text-brand-600 hover:underline">← All poets</Link>
      <h1 className="text-2xl font-bold text-brand-800">New poet</h1>
      <p className="text-sm text-ink/70">After you create the poet you can add audio, PDF books and video links on the next page.</p>
      <PoetForm />
    </div>
  );
}
