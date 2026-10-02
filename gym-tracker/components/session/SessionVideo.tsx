"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { ExerciseMedia } from "@/types";

function embedUrl(media: ExerciseMedia, muted: boolean): string | null {
  if (!media.youtubeId) return null;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: "1",
    mute: muted ? "1" : "0",
  });
  if (media.youtubeStart !== undefined) params.set("start", String(media.youtubeStart));
  return `https://www.youtube-nocookie.com/embed/${media.youtubeId}?${params.toString()}`;
}

export function SessionVideo({
  media,
  title,
  resetKey,
}: {
  media?: ExerciseMedia;
  title: string;
  resetKey: string;
}) {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(true);
  }, [resetKey]);

  if (!media) return null;
  const src = embedUrl(media, muted);
  const poster = media.image
    ? media.image
    : media.youtubeId
      ? `https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg`
      : null;

  if (!src && !poster) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 aspect-video">
      {src ? (
        <iframe
          key={`${resetKey}-${muted ? "muted" : "sound"}`}
          src={src}
          title={`${title} form video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover" />
        )
      )}
      {src && (
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white"
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {muted ? "Sound" : "Mute"}
        </button>
      )}
    </div>
  );
}
