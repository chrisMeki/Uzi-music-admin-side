import { Check } from 'lucide-react';

interface Artist {
  id: number;
  name: string;
}

interface UpdateModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  artist: Artist | null;
  loading: boolean;
}

export default function UpdateModal({ show, onClose, onConfirm, artist, loading }: UpdateModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Update Artist</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to update <span className="font-bold text-green-600">{artist?.name}</span>?
          </p>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={loading} className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-all text-sm lg:text-base disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all text-sm lg:text-base disabled:opacity-50">
              {loading ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}