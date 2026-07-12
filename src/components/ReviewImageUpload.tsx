import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

type ReviewImageUploadProps = {
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
};

export function ReviewPhoto({ url, className = '' }: { url: string; className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden border border-[rgba(244,246,250,0.08)] bg-[#08080B] ${className}`}>
      <img
        src={url}
        alt="Customer review photo"
        className="w-full h-32 sm:h-36 object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function ReviewImageUpload({
  previewUrl,
  onFileSelect,
  disabled = false,
  label = 'Photo (optional)',
  hint = 'JPG, PNG or WebP · max 5 MB',
}: ReviewImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      window.alert('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      window.alert('Image must be under 5 MB.');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div>
      <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#A9B3C7] mb-1.5">
        {label}
      </label>
      {previewUrl ? (
        <div className="relative">
          <ReviewPhoto url={previewUrl} />
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors disabled:opacity-50"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-[rgba(244,246,250,0.15)] bg-[rgba(7,10,18,0.4)] text-[#A9B3C7] hover:border-[rgba(46,209,180,0.35)] hover:text-[#F4F6FA] transition-colors disabled:opacity-50"
        >
          <ImagePlus className="w-6 h-6 text-[#2ED1B4]" />
          <span className="text-xs font-medium">Add a photo to your review</span>
          <span className="text-[10px] text-[#6B7280]">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export function revokePreviewUrl(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}
