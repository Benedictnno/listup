export default function CarouselSkeleton() {
    return (
        <div className="h-full min-h-[250px] md:min-h-[400px] w-full overflow-hidden rounded-2xl bg-slate-800 animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
    );
}
