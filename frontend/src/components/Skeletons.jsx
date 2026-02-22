// 1. Skeleton for the Product Cards (Used in Home, Store, New)
export const ItemCardSkeleton = () => (
  <div className="flex flex-col gap-3 w-full animate-pulse">
    {/* Image Area */}
    <div className="w-full aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
    {/* Title Area */}
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
    {/* Price/Size Area */}
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
    {/* Button Area */}
    <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full mt-2"></div>
  </div>
);

// 2. Skeleton for the Circular Categories (Used in Home)
export const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-4 animate-pulse">
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
  </div>
);

// 3. Skeleton for Checkout Layout (Used in Checkout)
export const CheckoutSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-12 animate-pulse w-full">
    {/* Left Column (Forms) */}
    <div className="space-y-8">
      <div className="h-[400px] bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700"></div>
      <div className="h-[200px] bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700"></div>
    </div>
    {/* Right Column (Summary) */}
    <div className="lg:pl-8">
      <div className="h-[500px] bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700"></div>
    </div>
  </div>
);
