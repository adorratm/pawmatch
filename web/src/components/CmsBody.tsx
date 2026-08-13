export function CmsBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="pt-4 text-2xl font-bold tracking-tight">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.startsWith('# ')) {
          return (
            <h2 key={i} className="pt-4 text-2xl font-bold tracking-tight">
              {block.slice(2)}
            </h2>
          );
        }
        const lines = block.split('\n');
        if (lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('• '))) {
          return (
            <ul key={i} className="space-y-2 rounded-2xl border border-white/10 bg-white/3 px-5 py-4">
              {lines.map((l) => (
                <li key={l} className="text-white/80">
                  {l.replace(/^\s*[-•]\s*/, '')}
                </li>
              ))}
            </ul>
          );
        }
        const img = block.match(/^!\[([^\]]*)\]\((https?:[^)\s]+)\)$/);
        if (img) {
          return (
            <img
              key={i}
              src={img[2]}
              alt={img[1] || ''}
              className="w-full rounded-2xl object-cover"
            />
          );
        }
        return (
          <p key={i} className="text-base leading-relaxed text-white/80">
            {block}
          </p>
        );
      })}
    </div>
  );
}
