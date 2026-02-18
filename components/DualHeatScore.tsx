import React from 'react';

interface DualHeatScoreProps {
  engagement: number; // 0-50
  fit: number; // 0-50
  size?: number;
}

const DualHeatScore: React.FC<DualHeatScoreProps> = ({ engagement, fit, size = 120 }) => {
  // SVG Configuration
  const center = size / 2;
  const strokeWidth = size * 0.08;
  
  // Outer Ring (Engagement)
  const radius1 = (size / 2) - strokeWidth;
  const circumference1 = 2 * Math.PI * radius1;
  const progress1 = (engagement / 50) * circumference1; // Normalized to 50 max
  
  // Inner Ring (Fit)
  const radius2 = radius1 - (strokeWidth * 2);
  const circumference2 = 2 * Math.PI * radius2;
  const progress2 = (fit / 50) * circumference2; // Normalized to 50 max

  const totalScore = engagement + fit; // 0-100

  // Color logic based on total score
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        
        {/* Outer Track (Engagement) */}
        <circle
          cx={center}
          cy={center}
          r={radius1}
          fill="none"
          stroke="currentColor"
          className="text-gray-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        {/* Outer Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius1}
          fill="none"
          stroke="currentColor"
          className="text-orange-500 transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference1}
          strokeDashoffset={circumference1 - progress1}
          strokeLinecap="round"
        />

        {/* Inner Track (Fit) */}
        <circle
          cx={center}
          cy={center}
          r={radius2}
          fill="none"
          stroke="currentColor"
          className="text-gray-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        {/* Inner Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius2}
          fill="none"
          stroke="currentColor"
          className="text-indigo-600 transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference2}
          strokeDashoffset={circumference2 - progress2}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getColor(totalScore)}`}>
          {totalScore}
        </span>
        <span className="text-[10px] font-medium text-slate-400 uppercase">Score</span>
      </div>
      
      {/* Legend (Optional overlay or tooltip context) */}
    </div>
  );
};

export default DualHeatScore;