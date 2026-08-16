import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building2, AlertTriangle } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { EpiItem } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EpiItem | null;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, item }) => {
  const { locations, transferStock } = useStock();

  const [targetLocationId, setTargetLocationId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Reposição de estoque de base a partir do almoxarifado central Vivo');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableTargetLocations = locations.filter(l => l.id !== item?.locationId);

  useEffect(() => {
    if (isOpen && availableTargetLocations.length > 0) {
      setTargetLocationId(availableTargetLocations[0]?.id || '');
      setQuantity(Math.min(item?.quantity || 1, 5));
      setReason('Transferência de suprimentos entre almoxarifados Vivo');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const sourceLoc = locations.find(l => l.id === item.locationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!targetLocationId) {
      setErrorMsg('Selecione o almoxarifado de destino.');
      return;
    }

    if (quantity <= 0 || quantity > item.quantity) {
      setErrorMsg(`Quantidade inválida. Saldo disponível na origem: ${item.quantity} ${item.unit}.`);
      return;
    }

    const res = transferStock({
      sourceItemId: item.id,
      targetLocationId,
      quantity,
      reason,
      notes,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erro ao realizar transferência.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Transferência entre Almoxarifados Vivo
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                {item.name} ({item.caNumber})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Source and Target Box */}
          <div className="p-3.5 bg-[#FAF7FC] rounded-xl border border-purple-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Origem:</span>
              <strong className="text-slate-900">{sourceLoc?.name}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Saldo Disponível na Origem:</span>
              <strong className="text-[#660099] font-mono font-bold">{item.quantity} {item.unit}</strong>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Destino da Transferência *</label>
              <select
                value={targetLocationId}
                onChange={(e) => setTargetLocationId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#660099]"
                required
              >
                {availableTargetLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Quantidade a Transferir ({item.unit}) *</label>
            <input
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Motivo / Guia de Remessa *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Requisição interna de base operacional nº 450"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Observações / Transportador</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Enviado via frota interna Vivo"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-purple-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-bold shadow-sm shadow-purple-950/20 transition-all cursor-pointer"
            >
              Confirmar Transferência
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
