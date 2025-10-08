'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbItems = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`;
    return {
      label: formatLabel(path),
      href,
    };
  });

  if (paths.length > 0) {
    breadcrumbItems.unshift({
      label: 'Tableau de bord',
      href: '/dashboard',
    });
  }

  return (
    <div className="flex items-center text-base text-gray-400 mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-400"><ChevronRight className=' w-3 md:w-5 h-3 md:h-5'/></span>}
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-900 font-medium text-xs md:text-base">{item.label}</span>
          ) : (
            <Link 
              href={item.href} 
              className="hover:text-blue-600 hover:underline transition-colors text-xs md:text-base"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

function formatLabel(path: string): string {
  return path
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}