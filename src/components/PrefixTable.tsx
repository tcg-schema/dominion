interface Props {
  prefixes: Record<string, string>;
}

export default function PrefixTable({ prefixes }: Props) {
  return (
    <div className="rounded-lg border border-gold bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-lg font-semibold tracking-wide">Namespace Prefixes</h3>
      </div>
      <div className="p-4 space-y-1">
        {Object.entries(prefixes).map(([prefix, uri]) => (
          <div key={prefix} className="flex gap-3 text-sm font-mono">
            <span className="text-primary font-semibold min-w-[80px]">@{prefix}</span>
            <a
              href={uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors break-all"
            >
              {uri}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
