export default function SearchBarSkeleton() {
    return (
        <div className="w-full animate-pulse">
            <div className="relative flex">
                <div className="flex-1 h-12 bg-white/10 rounded-l-lg"></div>
                <div className="w-24 h-12 bg-lime-400/50 rounded-r-lg"></div>
            </div>
        </div>
    );
}
