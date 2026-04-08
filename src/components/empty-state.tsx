type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-10 text-center">
      <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-600">
        {description}
      </p>
    </div>
  );
}
