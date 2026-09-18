import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { CheckIcon, TrashIcon } from './icons';

type Variant = 'default' | 'ok' | 'grey';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
  label: string;
  children: ReactNode;
}

export function RoundButton({ variant = 'default', small, label, children, className = '', ...rest }: Props) {
  const cls = ['round', variant === 'ok' && 'round--ok', variant === 'grey' && 'round--grey', small && 'round--small', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function OkButton(props: Omit<Props, 'label' | 'children' | 'variant'>) {
  return (
    <RoundButton variant="ok" label="OK" {...props}>
      <CheckIcon />
    </RoundButton>
  );
}

export function TrashButton(props: Omit<Props, 'label' | 'children' | 'variant'>) {
  return (
    <RoundButton variant="grey" label="Eingabe löschen" {...props}>
      <TrashIcon />
    </RoundButton>
  );
}

export function UnknownButton(props: Omit<Props, 'label' | 'children' | 'variant'>) {
  return (
    <RoundButton variant="grey" label="Ich weiß es nicht" {...props}>
      <span style={{ fontWeight: 800, fontSize: 20 }}>?</span>
    </RoundButton>
  );
}
