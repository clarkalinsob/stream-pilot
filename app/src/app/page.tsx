'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((health) => setStatus(`API: ${health.status} | DB: ${health.db}`))
      .catch(() => setStatus('API unreachable'));
  }, []);

  return (
    <main>
      <h1>Stream Pilot</h1>
      <p>{status}</p>
    </main>
  );
}
