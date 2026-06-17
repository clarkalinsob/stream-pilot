import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CreateButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
};

type CreateButtonLinkProps = CreateButtonBaseProps & {
  href: string;
  onClick?: never;
  disabled?: never;
};

type CreateButtonActionProps = CreateButtonBaseProps & {
  href?: never;
  onClick: () => void;
  disabled?: boolean;
};

type CreateButtonProps = CreateButtonLinkProps | CreateButtonActionProps;

export function CreateButton({
  children,
  className,
  href,
  onClick,
  disabled,
}: CreateButtonProps) {
  if (href) {
    return (
      <Button asChild className={cn(className)}>
        <Link href={href}>
          <Plus />
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button className={cn(className)} onClick={onClick} disabled={disabled}>
      <Plus />
      {children}
    </Button>
  );
}
