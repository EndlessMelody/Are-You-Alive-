import React, { useMemo } from "react";

const CosmicBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="cosmic-bg">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            "--duration": star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
      <div className="nebula-overlay" />
      <style jsx>{`
        .nebula-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 80% 20%,
              rgba(59, 130, 246, 0.05) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 20% 80%,
              rgba(245, 158, 11, 0.03) 0%,
              transparent 50%
            );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default CosmicBackground;
