"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import type { ExerciseMedia, ExerciseMediaBlockProps } from "@/types";

const SOURCE_LABELS: Record<ExerciseMedia["source"], string> = {
  askdoctorjo: "AskDoctorJo",
  athleanx: "ATHLEAN-X",
  muscleandstrength: "Muscle & Strength",
  other: "Video",
};

function youtubeWatchUrl(media: ExerciseMedia): string | null {
  if (!media.youtubeId) return null;
  if (media.youtubeStart !== undefined) {
    return `https://www.youtube.com/watch?v=${media.youtubeId}&t=${media.youtubeStart}s`;
  }
  return `https://www.youtube.com/watch?v=${media.youtubeId}`;
}

function youtubeEmbedUrl(media: ExerciseMedia): string | null {
  if (!media.youtubeId) return null;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: "1",
  });
  if (media.youtubeStart !== undefined) {
    params.set("start", String(media.youtubeStart));
  }
  return `https://www.youtube-nocookie.com/embed/${media.youtubeId}?${params.toString()}`;
}

export function ExerciseMediaBlock({ media, title }: ExerciseMediaBlockProps) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = youtubeWatchUrl(media);
  const embedUrl = youtubeEmbedUrl(media);
  const poster = media.image
    ? media.image
    : media.youtubeId
      ? `https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg`
      : null;

  if (!poster && !embedUrl) return null;

  return (
    <div className="mt-2">
      <div className="relative overflow-hidden rounded-lg border border-gray-700/30 bg-gray-950 aspect-video">
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${title} form video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            {poster && (
              // Local stills are offline-safe. YouTube thumbnails need a network.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={`${title} form`}
                className="h-full w-full object-cover"
              />
            )}
            {embedUrl && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/35"
                aria-label={`Play ${title} form video`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                  <Play size={18} className="ml-0.5 fill-white" />
                </span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
        <span>Form: {SOURCE_LABELS[media.source]}</span>
        {watchUrl && (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
          >
            Open in YouTube
            <ExternalLink size={10} />
          </a>
        )}
        {media.guideUrl && (
          <a
            href={media.guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-300"
          >
            Illustration
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
