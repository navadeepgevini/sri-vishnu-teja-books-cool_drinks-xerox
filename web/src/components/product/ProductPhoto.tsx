// A real product photo in place of the 3D model: same stage as the 3D view (saffron pedestal glow,
// product centred), with a gentle lift on card hover. Motion is skipped for reduced-motion users.
export default function ProductPhoto({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        aria-hidden
        className="absolute bottom-[9%] h-[12%] w-[62%] rounded-[50%] bg-soft-saffron/70 blur-md"
      />
      <img
        src={src}
        alt={alt}
        width={800}
        height={800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="relative h-[88%] w-[88%] object-contain drop-shadow-[0_10px_12px_rgba(27,31,42,0.18)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:scale-[1.06]"
      />
    </div>
  )
}
