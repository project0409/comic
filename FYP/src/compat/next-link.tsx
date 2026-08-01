import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function Link({ href, children, ...props }: LinkProps) {
  const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
  if (external) return <a href={href} {...props}>{children}</a>;
  return <RouterLink to={href} {...props}>{children}</RouterLink>;
}
