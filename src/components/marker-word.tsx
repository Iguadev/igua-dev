export function MarkerWord({ text, word }: { text: string; word: string }) {
  const at = text.indexOf(word);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="marker-word">{word}</span>
      {text.slice(at + word.length)}
    </>
  );
}
