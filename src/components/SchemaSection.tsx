import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SchemaSection as SchemaSectionType } from "@/lib/ttl-parser";

interface Props {
  section: SchemaSectionType;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  "tcg:CardGame": "bg-primary/20 text-primary",
  "schema:DefinedTermSet": "bg-accent/20 text-accent",
  "schema:DefinedTerm": "bg-secondary text-secondary-foreground",
  "tcg:ResourceSystem": "bg-primary/15 text-primary",
  "tcg:ResourceType": "bg-primary/10 text-primary",
  "tcg:TurnStructure": "bg-accent/15 text-accent",
  "tcg:TurnPhase": "bg-accent/20 text-accent",
  "tcg:GameState": "bg-muted text-muted-foreground",
  "tcg:EndCondition": "bg-destructive/20 text-destructive-foreground",
  "tcg:GameAction": "bg-primary/20 text-primary",
  "tcg:Effect": "bg-accent/15 text-accent",
  "tcg:Player": "bg-secondary text-secondary-foreground",
  "tcg:Zone": "bg-muted text-muted-foreground",
};

function getTypeBadge(triples: SchemaSectionType["triples"], subject: string) {
  const typeTriple = triples.find(
    (t) => t.subject === subject && t.predicate === "a"
  );
  if (!typeTriple) return null;
  const types = typeTriple.object.split(",").map((t) => t.trim());
  return types.map((type) => (
    <span
      key={type}
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[type] || "bg-muted text-muted-foreground"}`}
    >
      {type}
    </span>
  ));
}

export default function SchemaSection({ section, index }: Props) {
  const [open, setOpen] = useState(index < 3);

  // Group triples by subject
  const grouped = new Map<string, SchemaSectionType["triples"]>();
  for (const t of section.triples) {
    if (!grouped.has(t.subject)) grouped.set(t.subject, []);
    grouped.get(t.subject)!.push(t);
  }

  return (
    <div className="rounded-lg border border-gold bg-card overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-5 h-5 text-primary shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <h3 className="text-lg font-semibold tracking-wide">{section.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {grouped.size} {grouped.size === 1 ? "entity" : "entities"}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {Array.from(grouped.entries()).map(([subject, triples]) => (
            <div
              key={subject}
              className="rounded-md border border-border bg-muted/30 p-4 space-y-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-semibold text-primary">{subject}</code>
                {getTypeBadge(triples, subject)}
              </div>
              <div className="space-y-1">
                {triples
                  .filter((t) => t.predicate !== "a")
                  .map((t, i) => (
                    <div key={i} className="flex gap-2 text-sm font-mono">
                      <span className="text-muted-foreground shrink-0 min-w-[160px]">
                        {t.predicate}
                      </span>
                      <span className="text-foreground break-all">{t.object}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
