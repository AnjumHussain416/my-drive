import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumnProps = {
  title?: string;
  links?: FooterLink[];
};

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="col-span-1 pb-6  lg:pb-0 l-6 ">
      <div className="grid gap-4 ">
        {title && <p className="text-xl text-black font-semibold">{title}</p>}

        {(links ?? []).map((item: FooterLink, index: number) => (
          <Link
            key={index}
            href={item.href}
            className="text-xl text-gray-1200 hover:text-black font-semibold text-center lg:text-start"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
