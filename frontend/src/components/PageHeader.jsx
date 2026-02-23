// src/components/PageHeader.jsx
import PropTypes from "prop-types";

const PageHeader = ({
  title,
  subtitle,
  breadcrumb,
  bgSrc = "/farm.png",
  heightClass = "h-[220px] sm:h-[360px]", // <-- Drastically reduced mobile height
}) => {
  return (
    <div className="relative w-full overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800 transition-colors duration-300">
      {/* Background */}
      <div className={`w-full ${heightClass} bg-cover bg-center`}>
        <img
          src={bgSrc}
          alt=""
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Readability overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Light mode: Simple light overlay */}
        <div className="absolute inset-0 bg-neutral-900/10 dark:hidden" />

        {/* Dark mode: Darker wash + bottom fade */}
        <div className="absolute inset-0 hidden dark:block bg-black/80" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          {/* Glass card - Shrunk padding for mobile */}
          <div className="max-w-3xl w-full sm:w-auto rounded-2xl sm:rounded-3xl border border-white/30 dark:border-white/10 bg-white/55 dark:bg-black/25 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30 px-4 sm:px-10 py-5 sm:py-10 text-center">
            {/* Breadcrumb pill - Shrunk text and padding for mobile */}
            <div className="mb-3 sm:mb-5 flex justify-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/35 dark:border-white/10 bg-white/55 dark:bg-black/20 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-semibold tracking-wide text-neutral-800 dark:text-white">
                {breadcrumb.map((c, idx) => (
                  <span key={idx} className="flex items-center">
                    {idx > 0 && (
                      <span className="mx-1.5 sm:mx-2 opacity-50">/</span>
                    )}
                    {c.href ? (
                      <a
                        href={c.href}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      >
                        {c.label}
                      </a>
                    ) : (
                      <span
                        className={
                          idx === breadcrumb.length - 1
                            ? "opacity-100"
                            : "opacity-80"
                        }
                      >
                        {c.label}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Title: brand green gradient - Shrunk font size for mobile */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 dark:from-green-300 dark:via-emerald-300 dark:to-green-400">
                {title}
              </span>
            </h1>

            {/* Subtitle - Shrunk text and tighter margin for mobile */}
            {subtitle && (
              <p className="mt-2 sm:mt-4 text-xs sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 line-clamp-2 sm:line-clamp-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  breadcrumb: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    }),
  ).isRequired,
  bgSrc: PropTypes.string,
  heightClass: PropTypes.string,
};

export default PageHeader;
