import { BookOpen, Clock, BarChart2, Star, Zap } from "lucide-react";

export default function CourseCard({ course }) {
  const { title, description, level, duration, rating, imageUrl, isTrending } =
    course;
  return (
    <div className="bg-[#0B0B0B] border border-gray-800 rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 w-full">
      <div className="relative">
        <img
          className="h-44 w-full object-cover"
          src={imageUrl}
          alt={`Thumbnail for ${title}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x400/111/ff4a1f?text=${encodeURIComponent(
              title
            )}`;
          }}
        />

        {isTrending && (
          <span className="absolute top-3 left-3 bg-[#FF4A1F] text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path d="M13 2L3 14h9l-2 8 10-12h-9l2-8z" fill="#000" />
            </svg>
            Trending
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 h-16 overflow-hidden">
          {description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4 items-center">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 2h9v6H6z" fill="#FF4A1F" />
            </svg>
            <span className="text-gray-300">{level}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 8v5l3 3"
                stroke="#FF4A1F"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-gray-300">{duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="#FFB020"
              />
            </svg>
            <span className="text-gray-300">{rating} / 5</span>
          </div>
        </div>

        <button className="w-full mt-3 py-2 rounded-md bg-[#FF4A1F] text-black font-semibold hover:brightness-95 transition">
          Start Learning
        </button>
      </div>
    </div>
  );
}
