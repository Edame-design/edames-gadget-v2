import { ArrowRight } from 'lucide-react';

type CategoryCardProps = {
  name: string;
  icon: string;
};

export function CategoryCard({
  name,
  icon,
}: CategoryCardProps) {
  return (
    <a
      href="#shop"
      className="
        group
        min-w-36
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        text-center
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-lg
        sm:min-w-0
      "
    >
      {/* Icon */}
      <div
        className="
          mx-auto
          mb-4
          grid
          size-16
          place-items-center
          rounded-2xl
          bg-slate-50
          text-3xl
          transition
          duration-200
          group-hover:bg-blue-50
          group-hover:scale-105
        "
      >
        {icon}
      </div>

      {/* Category name */}
      <p
        className="
          font-semibold
          text-slate-900
          transition-colors
          group-hover:text-blue-600
        "
      >
        {name}
      </p>

      {/* Action */}
      <span
        className="
          mt-2
          inline-flex
          items-center
          gap-1
          text-xs
          font-medium
          text-slate-500
          transition-colors
          group-hover:text-blue-600
        "
      >
        Shop now
        <ArrowRight
          size={13}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
        />
      </span>
    </a>
  );
}