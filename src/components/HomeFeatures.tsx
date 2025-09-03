import React from 'react';

const features = [
  {
    title: 'Calm UI',
    desc: 'A minimal, distraction-free interface that puts your tasks front and center.',
  },
  {
    title: 'Intentional workflows',
    desc: 'Plan your day with intention — recurring dailies, focus sessions, and gentle nudges.',
  },
  {
    title: 'Contextual projects',
    desc: 'Keep projects lean and focused; group tasks where they belong.',
  },
  {
    title: 'Privacy-first',
    desc: 'Your data stays local unless you opt-in to cloud sync.',
  },
];

export default function HomeFeatures() {
  return (
    <section className="py-20 min-h-screen flex items-center">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold">A different kind of productivity</h2>
          <p className="mt-3 text-gray-600">Built around calm, clarity, and long-term focus.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl p-6 bg-white shadow hover:shadow-xl transition transform-gpu hover:-translate-y-1"
            >
              <div className="text-emerald-600 font-semibold">{`0${i + 1}`}</div>
              <h3 className="mt-2 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
