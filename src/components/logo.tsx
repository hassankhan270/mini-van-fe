export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Roamly">
      <rect width="32" height="32" rx="9" fill="#121a2e" />
      <circle cx="16" cy="11" r="5" fill="#e0a64e" />
      <path d="M4 25 Q16 14 28 25" stroke="#f8f9fc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
