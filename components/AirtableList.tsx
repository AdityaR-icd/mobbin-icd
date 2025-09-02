import React, { useEffect, useState } from "react";

type AirtableRecord = {
  id: string;
  fields: { [key: string]: any };
};

export default function AirtableList() {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        // If your backend is at the same origin:
        const res = await fetch("/api/airtable");
        // If your backend runs elsewhere (dev example):
        // const res = await fetch("http://localhost:3000/api/airtable");

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        // Expecting data like: { records: [ { id, fields: {...} } ], offset?: "..." }
        if (isMounted) setRecords(data.records || []);
      } catch (err) {
        if (isMounted) {
          const errorMsg =
            typeof err === "object" && err !== null && "message" in err
              ? String((err as { message?: unknown }).message)
              : "Something went wrong";
          setError(errorMsg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h2>Airtable Records</h2>
      <ul>
        {records.map((rec) => (
          <li key={rec.id}>
            {/* Replace “Name” with a real field from your table */}
            {rec.fields?.Name ?? "(no name)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
