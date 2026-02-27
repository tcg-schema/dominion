import { useEffect, useState } from "react";
import { Download, Crown, Loader2 } from "lucide-react";
import { parseTTL, type ParsedTTL } from "@/lib/ttl-parser";
import SchemaSection from "@/components/SchemaSection";
import PrefixTable from "@/components/PrefixTable";

const TTL_PATH = "/data/dom.ttl";

export default function Index() {
  const [data, setData] = useState<ParsedTTL | null>(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(TTL_PATH)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load schema");
        return r.text();
      })
      .then((text) => {
        setRaw(text);
        setData(parseTTL(text));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    const blob = new Blob([raw], { type: "text/turtle" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dom.ttl";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-gold">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(43_80%_55%/0.08),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gold-glow mb-3">
            Dominion Schema Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Explore the Turtle (TTL) ontology for the Dominion card game — zones, resources, turn structure, actions, and more.
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download dom.ttl
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <PrefixTable prefixes={data.prefixes} />
        {data.sections.map((section, i) => (
          <SchemaSection key={section.title} section={section} index={i} />
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Dynamically parsed from <code className="text-primary">dom.ttl</code>
      </footer>
    </div>
  );
}
