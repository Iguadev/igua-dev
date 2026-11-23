export function Symbol({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/brand/symbol-reverse.svg"
      alt=""
      width={240}
      height={200}
      aria-hidden="true"
    />
  );
}
export function Wordmark() {
  return (
    <img
      className="wordmark"
      src="/brand/wordmark-reverse.svg"
      alt="IGUA.DEV"
      width={744}
      height={200}
    />
  );
}
