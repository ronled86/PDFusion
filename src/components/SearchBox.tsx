import React, { useState } from "react";

export default function SearchBox({
  onSearch
}: { onSearch: (query: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="p-2 border-b flex gap-2">
      <input className="border px-2 py-1 flex-1" placeholder="Search text" value={q} onChange={e => setQ(e.target.value)} />
      <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => onSearch(q)}>Find</button>
    </div>
  );
}
