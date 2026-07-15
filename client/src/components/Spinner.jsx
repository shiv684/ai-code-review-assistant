export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}