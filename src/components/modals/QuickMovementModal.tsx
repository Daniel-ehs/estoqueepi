import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { EpiItem, MovementType } from '../../types';

interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EpiItem | null;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({ isOpen, onClose, item }) => {
  const { registerSingleMovement, locations } = useStock();

  const [type, setType] = useState<MovementType>('SAIDA');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Entrega direta ao colaborador Vivo');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeRole, setEmployeeRole] = useState<string>('');
  const [employeeReg, setEmployeeReg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType('SAIDA');
      setQuantity(1);
      setReason('Entrega direta ao colaborador Vivo');
      setEmployeeName('');
      setEmployeeRole('');
      setEmployeeReg('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const loc = locations.find(l => l.id === item.locationId);
  const isOut = type === 'SAIDA' || type === 'AVARIA';
  const projectedStock = isOut ? item.quantity - quantity : item.quantity + quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    const res = registerSingleMovement({
      itemId: item.id,
      type,
      quantity,
      reason,
      employeeName: employeeName.trim() || undefined,
      employeeRole: employeeRole.trim() || undefined,
      employeeRegistration: employeeReg.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erro ao registrar movimentação.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Movimentação Rápida de Estoque Vivo
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
              {item.name} ({item.caNumber})
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Preview Card */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-[#2a0042] to-slate-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-300">Localidade: {loc?.name}</span>
            <div className="text-sm font-semibold text-slate-200">Saldo Atual: <strong className="text-purple-300 font-mono text-base">{item.quantity} {item.unit}</strong></div>
          </div>
          <div className="text-right text-xs text-slate-300">
            <span>Saldo projetado:</span>
            <div className={`font-mono font-bold text-base ${projectedStock < 0 ? 'text-rose-400 font-extrabold' : 'text-white'}`}>
              {projectedStock} {item.unit}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tipo de Movimento *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MovementType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 font-medium"
              >
                <option value="SAIDA">Saída / Entrega</option>
                <option value="ENTRADA">Entrada / Reposição</option>
                <option value="DEVOLUCAO">Devolução</option>
                <option value="AVARIA">Avaria / Descarte</option>
                <option value="AJUSTE">Ajuste de Inventário</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quantidade ({item.unit}) *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Motivo do Lançamento *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Entrega periódica, substituição por dano..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nome do Colaborador</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Ex: Marcos Silva"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Cargo / Matrícula</label>
              <input
                type="text"
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                placeholder="Ex: Técnico Fibra (VIV-1234)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Observações</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Assinado na ficha física de controle NR-6."
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
              Confirmar Movimentação
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
