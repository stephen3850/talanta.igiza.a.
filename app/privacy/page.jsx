'use client';

import { useEffect, useState } from 'react';

export default function PrivacyNoticePage() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/privacy/notices', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Privacy notices are unavailable.');
        setNotices(result.notices);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-navy-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Privacy information</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Privacy notices</h1>
          <p className="mt-3 text-sm text-slate-400">Only notices explicitly published by an administrator appear here. Publication in this application is not a legal-compliance certification.</p>
        </header>
        {loading && <p className="text-sm text-slate-400">Loading published notices…</p>}
        {error && <p role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">{error}</p>}
        {!loading && !error && !notices.length && <p className="rounded-xl border border-navy-800 bg-navy-900 p-5 text-sm text-slate-300">No privacy notice has been published in the platform yet. Contact the platform administrator for privacy enquiries.</p>}
        {notices.map((notice) => <article key={notice.version} className="rounded-2xl border border-navy-800 bg-navy-900 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-semibold text-white">{notice.title}</h2><span className="text-xs text-slate-500">Version {notice.version}</span></div>
          <p className="mt-1 text-xs text-slate-500">Published {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString() : 'date not recorded'}</p>
          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{notice.body}</div>
        </article>)}
      </section>
    </main>
  );
}
