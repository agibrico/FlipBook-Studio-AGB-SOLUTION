import React, { useState } from 'react';
import { FileSpreadsheet, Check, Sparkles, X, Calculator, Send, AlertCircle } from 'lucide-react';
import { InPageFormConfig, InPageFormSubmission } from '../types/saas';
import { formBuilderService } from '../services/formBuilderService';

interface InPageFormModalProps {
  form: InPageFormConfig;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (submission: InPageFormSubmission) => void;
}

export const InPageFormModal: React.FC<InPageFormModalProps> = ({
  form,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    form.fields.forEach((f) => {
      init[f.id] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    return init;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calcul dynamique du devis estimé si activé
  const nights = Number(formValues.nights || 3);
  const estimatedTotal = form.enablePriceCalculation ? nights * 1200 + 350 : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation champs requis
    for (const field of form.fields) {
      if (field.required && !formValues[field.id]) {
        setErrorMsg(`Le champ "${field.label}" est obligatoire.`);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newSub = formBuilderService.submitForm({
        formId: form.id,
        flipbookId: form.flipbookId,
        pageNumber: form.pageNumber,
        values: formValues,
        calculatedQuoteTotal: estimatedTotal || undefined,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      if (onSubmitted) onSubmitted(newSub);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{form.title}</h3>
              <p className="text-xs text-zinc-400">Phase 32 • Formulaire dynamique intégré page {form.pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Demande enregistrée avec succès !</h4>
            <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">{form.successMessage}</p>
            {estimatedTotal && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl max-w-xs mx-auto">
                <span className="text-xs text-zinc-400 block mb-1">Montant pré-estimé du devis</span>
                <span className="text-2xl font-bold text-amber-400">{estimatedTotal.toLocaleString('fr-FR')} €</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Retourner à la lecture
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {form.subtitle && <p className="text-xs text-zinc-400 leading-relaxed">{form.subtitle}</p>}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Champs du formulaire */}
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  {field.label} {field.required && <span className="text-amber-400">*</span>}
                </label>

                {field.type === 'TEXT' || field.type === 'EMAIL' || field.type === 'PHONE' ? (
                  <input
                    type={field.type.toLowerCase()}
                    placeholder={field.placeholder}
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                ) : field.type === 'SELECT' ? (
                  <select
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 transition"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'RANGE_SLIDER' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>1 {field.unit}</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {formValues[field.id]} {field.unit}
                      </span>
                      <span>14 {field.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={14}
                      value={formValues[field.id] || 3}
                      onChange={(e) => setFormValues({ ...formValues, [field.id]: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                ) : field.type === 'TEXTAREA' ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                ) : null}
              </div>
            ))}

            {/* Calculatrice de devis en direct */}
            {estimatedTotal && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 text-xs">
                  <Calculator className="w-4 h-4" />
                  <span>Estimation indicative en direct :</span>
                </div>
                <span className="text-base font-bold text-amber-400">{estimatedTotal.toLocaleString('fr-FR')} €</span>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Envoi en cours...' : form.submitButtonText}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
