import { Button } from '@react-email/components'

type CtaProps = {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
}

const primary = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'inline-block',
  letterSpacing: '-0.01em',
}

const secondary = {
  ...primary,
  backgroundColor: '#171717',
  color: '#ffffff',
  border: '1px solid #262626',
}

export function Cta({ href, label, variant = 'primary' }: CtaProps) {
  return (
    <Button href={href} style={variant === 'primary' ? primary : secondary}>
      {label}
    </Button>
  )
}
