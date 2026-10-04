import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppleVideoShowcaseProps {
  videoUrl: string;
  title: string;
  subtitle: string;
  tagline?: string;
  posterUrl?: string;
  badgeText?: string;
}

export const AppleVideoShowcase: React.FC<AppleVideoShowcaseProps> = ({
  videoUrl,
  title,
  subtitle,
  tagline,
  posterUrl,
  badgeText,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden bg-[#161617] border border-white/10 shadow-2xl my-12 group">
      {/* Background Video Player */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=80'}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover filter brightness-95 opacity-90 transition-all duration-700 group-hover:scale-105"
        />

        {/* Apple Gradient Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161617] via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

        {/* Video Controls Overlay */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full text-white hover:text-blue-400 transition-colors"
            title={isPlaying ? 'Pausar Video' : 'Reproducir Video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full text-white hover:text-blue-400 transition-colors"
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Text Overlay Section */}
      <div className="p-8 sm:p-12 relative z-10 -mt-16 sm:-mt-24">
        {badgeText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{badgeText}</span>
          </motion.div>
        )}

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl leading-tight"
        >
          {title}
        </motion.h3>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl font-semibold apple-titanium-gradient mt-2 max-w-xl"
          >
            {tagline}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-[#86868B] mt-4 max-w-2xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
};
