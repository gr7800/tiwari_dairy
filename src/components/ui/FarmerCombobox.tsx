"use client";

import { useMemo, useRef, useState } from "react";

export interface FarmerOption {
  id: string;
  farmer_code: string;
  name: string;
}

export function FarmerCombobox({
  farmers,
  name,
  defaultValue,
  required,
}: {
  farmers: FarmerOption[];
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initial = farmers.find((f) => f.id === defaultValue);
  const [query, setQuery] = useState(initial ? `${initial.farmer_code} — ${initial.name}` : "");
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farmers.slice(0, 20);
    return farmers
      .filter((f) => f.farmer_code.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [farmers, query]);

  function select(farmer: FarmerOption) {
    setSelectedId(farmer.id);
    setQuery(`${farmer.farmer_code} — ${farmer.name}`);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId("");
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search by farmer code or name"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      {isOpen && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {matches.map((farmer) => (
            <li key={farmer.id}>
              <button
                type="button"
                onMouseDown={() => select(farmer)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{farmer.farmer_code}</span>
                <span className="text-slate-500 dark:text-slate-400">{farmer.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
