export default function Toast({ message, type = 'error', onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-600',
    success: 'bg-green-600',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${styles[type]} text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">
        ✕
      </button>
    </div>
  );
}