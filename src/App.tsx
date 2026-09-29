import { useEffect, useState } from "react";
import { courtsApi, queueApi } from "./services/api";
import type { Court, QueueEntry } from "./types";

export default function App() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([courtsApi.list(), queueApi.list()])
      .then(([c, q]) => {
        setCourts(c);
        setQueue(q);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <pre className="p-4 text-sm">
      {error ?? JSON.stringify({ courts, queue }, null, 2)}
    </pre>
  );
}
