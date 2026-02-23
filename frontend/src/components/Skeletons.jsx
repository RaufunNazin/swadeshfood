// 1. Skeleton for the Product Cards (Used in Home, Store, New)
export const ItemCardSkeleton = () => (
  <div className="group relative bg-white dark:bg-neutral-800 rounded-3xl p-3 h-full flex flex-col border border-transparent dark:border-neutral-700 animate-pulse">
    {/* --- Image Area (Fixed to aspect-square) --- */}
    <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-2xl mb-3"></div>

    {/* --- Content Area --- */}
    <div className="flex flex-col flex-1 px-1">
      {/* Title */}
      <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-1"></div>

      {/* Price & Add Button Row */}
      <div className="flex items-center justify-between mt-auto pt-4">
        <div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-10 mb-1"></div>
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
      </div>
    </div>
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

// 4. Skeleton for the Top Notification Banner (NEW)
export const NotificationSkeleton = () => (
  <div className="w-full bg-neutral-100 dark:bg-neutral-900/50 py-3 px-4 flex justify-center items-center z-[20] relative border-b border-transparent dark:border-neutral-800">
    <div className="h-4 w-48 sm:w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"></div>
  </div>
);
