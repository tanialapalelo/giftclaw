export default function ClawLoading() {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="font-pixel text-[8px] text-yellow-400 animate-blink">
          LOADING GAME...
        </p>
        <div className="grid grid-cols-2 gap-1 w-8 mx-auto">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 w-3 bg-yellow-400 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
