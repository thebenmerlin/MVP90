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
      <DialogContent className="p-0 overflow-hidden bg-card border border-border shadow-xl rounded-lg max-w-lg">
        <Command
          className="flex h-full w-full flex-col overflow-hidden bg-card text-foreground"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <Command.Input
            className="flex h-12 w-full bg-transparent px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b border-border"
            placeholder="Search startups, founders, cities…"
            value={search}
            onValueChange={setSearch}
            autoFocus
          />
          <Command.List className="max-h-[320px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-8 text-center text-[13px] text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Startups" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mt-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center px-4 py-2 text-[13px] outline-none rounded-sm aria-selected:bg-primary/8 aria-selected:border-l-2 aria-selected:border-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150"
                value="neurolink"
                onSelect={() => {
                  setOpen(false);
                  onSelectStartup("1");
                }}
              >
                NeuroLink AI <span className="ml-2 text-[11px] text-muted-foreground">AI/ML</span>
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center px-4 py-2 text-[13px] outline-none rounded-sm aria-selected:bg-primary/8 aria-selected:border-l-2 aria-selected:border-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150"
                value="cropsense"
                onSelect={() => {
                  setOpen(false);
                  onSelectStartup("2");
                }}
              >
                CropSense <span className="ml-2 text-[11px] text-muted-foreground">AgTech</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Founders" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mt-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center px-4 py-2 text-[13px] outline-none rounded-sm aria-selected:bg-primary/8 aria-selected:border-l-2 aria-selected:border-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150"
                value="founder-john"
                onSelect={() => {
                  setOpen(false);
                  onSelectFounder("octocat");
                }}
              >
                John Doe <span className="ml-2 text-[11px] text-muted-foreground">NeuroLink AI</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Cities" className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mt-2">
              <Command.Item
                className="relative flex cursor-pointer select-none items-center px-4 py-2 text-[13px] outline-none rounded-sm aria-selected:bg-primary/8 aria-selected:border-l-2 aria-selected:border-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150"
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
          <div className="border-t border-border px-4 py-2 flex gap-4">
            <span className="text-[11px] text-muted-foreground"><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span className="text-[11px] text-muted-foreground"><kbd className="font-mono">↵</kbd> select</span>
            <span className="text-[11px] text-muted-foreground"><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
