"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GlobalCommandPaletteProps {
  onSelectStartup: (id: string) => void;
  onSelectFounder: (id: string) => void;
  onSelectCity: (city: string) => void;
}

export function GlobalCommandPalette({ onSelectStartup, onSelectFounder, onSelectCity }: GlobalCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl bg-background border border-border max-w-2xl">
        <Command className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <Command.Input
            className="flex h-11 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b border-border"
            placeholder="Search startups, founders, and cities... (Cmd+K)"
            value={search}
            onValueChange={setSearch}
            autoFocus
          />
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

            <Command.Group heading="Startups" className="px-2 text-xs font-medium text-muted-foreground py-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                value="neurolink"
                onSelect={() => {
                  setOpen(false);
                  onSelectStartup("1");
                }}
              >
                NeuroLink AI (AI)
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                value="cropsense"
                onSelect={() => {
                  setOpen(false);
                  onSelectStartup("2");
                }}
              >
                CropSense (AgTech)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Founders" className="px-2 text-xs font-medium text-muted-foreground py-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                value="founder-john"
                onSelect={() => {
                  setOpen(false);
                  onSelectFounder("octocat");
                }}
              >
                John Doe (NeuroLink AI)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Cities" className="px-2 text-xs font-medium text-muted-foreground py-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                value="bangalore"
                onSelect={() => {
                  setOpen(false);
                  onSelectCity("Bangalore");
                }}
              >
                Bangalore
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
