import React, { useState } from 'react';
import { Star, ThumbsUp, Send, CheckCircle2, MessageSquare, X } from 'lucide-react';

interface PageSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  documentTitle: string;
}

export const PageSurveyModal: React.FC<PageSurveyModalProps> = ({
  isOpen,
  onClose,
  pageNumber,
  documentTitle,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Votre Avis sur cette Page</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xs">
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Merci pour votre retour !</p>
            <p className="text-xs text-zinc-400">Votre évaluation a bien été prise en compte.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-zinc-300">
              Comment évaluez-vous la clarté et l'intérêt des prestations présentées en Page {pageNumber} ?
            </p>

            {/* 5-Star Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-zinc-400 mb-1">Un commentaire ou suggestion ?</label>
              <textarea
                rows={3}
                placeholder="Ex: Tarifs très clairs, photos magnifiques..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
              >
                Passer
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer mon avis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
