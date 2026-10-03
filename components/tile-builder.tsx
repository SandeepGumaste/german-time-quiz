"use client";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export type Tile = { id: number; text: string };
export type TileStatus = { correct: boolean; mismatches: number[] } | null;

const tileBase = "px-4 py-3 min-h-12 rounded-xl border-2 text-lg font-semibold select-none transition active:scale-95";

// Word tiles you can tap (add/remove) or drag (add, reorder, remove).
export function TileBuilder({
  tiles,
  placed,
  onChange,
  status,
}: {
  tiles: Tile[];
  placed: number[];
  onChange: (placed: number[]) => void;
  status: TileStatus;
}) {
  const dragId = useRef<number | null>(null);
  const locked = status !== null;
  const bank = tiles.filter((t) => !placed.includes(t.id));
  const text = (id: number) => tiles.find((t) => t.id === id)!.text;

  const add = (id: number) => !locked && !placed.includes(id) && onChange([...placed, id]);
  const remove = (id: number) => !locked && onChange(placed.filter((x) => x !== id));
  // Insert `id` before `beforeId` (or at the end), moving it if it is already placed.
  const moveTo = (id: number, beforeId?: number) => {
    if (locked || id === beforeId) return;
    const rest = placed.filter((x) => x !== id);
    const at = beforeId === undefined ? rest.length : rest.indexOf(beforeId);
    rest.splice(at < 0 ? rest.length : at, 0, id);
    onChange(rest);
  };

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dragId.current !== null && moveTo(dragId.current)}
        className={cn(
          "w-full max-w-xl min-h-24 p-3 rounded-xl border-2 border-dashed flex flex-wrap gap-2 items-center",
          status?.correct && "border-green-600 bg-green-50",
          status && !status.correct && "border-red-400 bg-red-50"
        )}
      >
        {placed.length === 0 && <span className="text-gray-400 mx-auto">Tap or drag the words here</span>}
        {placed.map((id, i) => {
          const wrong = status && !status.correct && status.mismatches.includes(i);
          return (
            <button
              key={id}
              type="button"
              draggable={!locked}
              onDragStart={() => (dragId.current = id)}
              onDragEnd={() => (dragId.current = null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.stopPropagation();
                if (dragId.current !== null) moveTo(dragId.current, id);
              }}
              onClick={() => remove(id)}
              style={status?.correct ? { animationDelay: `${i * 80}ms` } : undefined}
              className={cn(
                tileBase,
                "bg-white border-gray-400 cursor-grab",
                status?.correct && "bg-green-600 border-green-700 text-white animate-in zoom-in-50 duration-300 fill-mode-both",
                status && !status.correct && (wrong ? "bg-red-600 border-red-700 text-white" : "bg-green-600 border-green-700 text-white"),
                locked && "cursor-default"
              )}
            >
              {text(id)}
            </button>
          );
        })}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dragId.current !== null && remove(dragId.current)}
        className="w-full max-w-xl min-h-20 flex flex-wrap gap-2 justify-center"
      >
        {bank.map((t) => (
          <button
            key={t.id}
            type="button"
            draggable={!locked}
            onDragStart={() => (dragId.current = t.id)}
            onDragEnd={() => (dragId.current = null)}
            onClick={() => add(t.id)}
            className={cn(tileBase, "bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-grab")}
          >
            {t.text}
          </button>
        ))}
      </div>
    </>
  );
}
