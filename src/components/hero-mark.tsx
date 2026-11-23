export function HeroMark({
  text,
  word,
  underline = false,
}: {
  text: string;
  word: string;
  underline?: boolean;
}) {
  const at = text.indexOf(word);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className={underline ? 'hero-mark hero-mark-second' : 'hero-mark'}>
        {word}
        {underline && (
          <svg className="hero-underline" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M5 17C62 9 150 5 295 11" pathLength={1} />
          </svg>
        )}
      </span>
      {text.slice(at + word.length)}
    </>
  );
}
