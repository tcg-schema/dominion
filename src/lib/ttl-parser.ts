export interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

export interface SchemaSection {
  title: string;
  triples: Triple[];
}

export interface ParsedTTL {
  prefixes: Record<string, string>;
  sections: SchemaSection[];
}

function shortenURI(uri: string, prefixes: Record<string, string>): string {
  for (const [prefix, ns] of Object.entries(prefixes)) {
    if (uri.startsWith(ns)) {
      return `${prefix}:${uri.slice(ns.length)}`;
    }
  }
  return uri;
}

export function parseTTL(raw: string): ParsedTTL {
  const prefixes: Record<string, string> = {};
  const sections: SchemaSection[] = [];

  const lines = raw.split('\n');
  let currentSection: SchemaSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse prefixes
    const prefixMatch = trimmed.match(/^@prefix\s+(\w+):\s+<([^>]+)>\s*\./);
    if (prefixMatch) {
      prefixes[prefixMatch[1]] = prefixMatch[2];
      continue;
    }

    // Section headers (comments starting with #)
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '').trim();
      if (headerText && !headerText.match(/^#+$/)) {
        // Check if we should start a new section
        if (!currentSection || currentSection.title !== headerText) {
          currentSection = { title: headerText, triples: [] };
          sections.push(currentSection);
        }
      }
      continue;
    }

    if (!trimmed || trimmed === '.') continue;

    // Parse triples (simplified)
    if (currentSection) {
      const parts = parseTripleLine(trimmed, prefixes);
      if (parts) {
        currentSection.triples.push(...parts);
      }
    }
  }

  // Deduplicate sections by title, merging triples
  const merged = new Map<string, SchemaSection>();
  for (const s of sections) {
    if (merged.has(s.title)) {
      merged.get(s.title)!.triples.push(...s.triples);
    } else {
      merged.set(s.title, { ...s });
    }
  }

  return { prefixes, sections: Array.from(merged.values()).filter(s => s.triples.length > 0) };
}

function parseTripleLine(line: string, prefixes: Record<string, string>): Triple[] | null {
  const triples: Triple[] = [];

  // Remove trailing dot
  let cleaned = line.replace(/\s*\.\s*$/, '').trim();
  if (!cleaned) return null;

  // Handle continuation lines (starting with ;)
  // This is a simplified parser; we'll just extract readable triples
  const segments = cleaned.split(/\s*;\s*/);

  let subject = '';
  for (const seg of segments) {
    const tokens = tokenize(seg);
    if (tokens.length >= 3 && !subject) {
      subject = tokens[0];
      triples.push({
        subject: resolveToken(subject, prefixes),
        predicate: resolveToken(tokens[1], prefixes),
        object: resolveToken(tokens.slice(2).join(' '), prefixes),
      });
    } else if (tokens.length >= 2 && subject) {
      triples.push({
        subject: resolveToken(subject, prefixes),
        predicate: resolveToken(tokens[0], prefixes),
        object: resolveToken(tokens.slice(1).join(' '), prefixes),
      });
    }
  }

  return triples.length > 0 ? triples : null;
}

function tokenize(s: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;
  let inBracket = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"' && s[i - 1] !== '\\') {
      inQuote = !inQuote;
      current += ch;
    } else if (ch === '[') {
      inBracket++;
      current += ch;
    } else if (ch === ']') {
      inBracket--;
      current += ch;
    } else if (ch === ' ' && !inQuote && inBracket === 0 && current) {
      tokens.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function resolveToken(token: string, prefixes: Record<string, string>): string {
  // If it's a quoted string, return as is
  if (token.startsWith('"')) {
    return token.replace(/"/g, '');
  }
  // If it's a prefixed name, expand for display but keep short form
  if (token.match(/^\w+:\w+$/)) {
    return token;
  }
  return token;
}
