interface InterSchoolLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InterSchoolLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: InterSchoolLogoProps) {
  const textColor = variant === 'light' ? '#FFFFFF' : '#1A1A1A';

  const sizes = {
    sm: { mark: 28, wordmarkSize: 13, gap: 8, letterSpacing: '0.18em' },
    md: { mark: 40, wordmarkSize: 18, gap: 12, letterSpacing: '0.2em' },
    lg: { mark: 64, wordmarkSize: 28, gap: 18, letterSpacing: '0.22em' },
  };

  const { mark, wordmarkSize, gap, letterSpacing } = sizes[size];

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap }}
    >
      {/* Triangle mark */}
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer triangle */}
        <polygon
          points="20,2 38,36 2,36"
          fill="none"
          stroke="#F5B800"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Inner triangle (smaller, filled gold) */}
        <polygon
          points="20,12 30,30 10,30"
          fill="#F5B800"
          opacity="0.9"
        />
      </svg>

      {/* Stacked wordmark */}
      <div
        style={{
          fontFamily: 'var(--font-barlow), "Barlow Condensed", sans-serif',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing,
          color: textColor,
          fontSize: wordmarkSize,
        }}
      >
        <div>INTER</div>
        <div>SCHOOL</div>
      </div>
    </div>
  );
}
