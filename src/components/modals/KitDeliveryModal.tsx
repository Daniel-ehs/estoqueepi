import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle2, AlertTriangle, Building2, User } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { EpiKit } from '../../types';

interface KitDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  kitId: string | null;
  locationId: string | null;
}

export const KitDeliveryModal: React.FC<KitDeliveryModalProps> = ({
  isOpen,
  onClose,
  kitId,
  locationId,
}) => {
  const { kits, locations, getKitAvailabilityForLocation, deliverKit } = useStock();

  const [quantityOfKits, setQuantityOfKits] = useState<number>(1);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeRole, setEmployeeRole] = useState<string>('');
  const [employeeReg, setEmployeeReg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const kit = kits.find(k => k.id === kitId);
  const loc = locations.find(l => l.id === locationId);

  const report = kitId && locationId ? getKitAvailabilityForLocation(kitId, locationId) : null;

  useEffect(() => {
    if (isOpen) {
      setQuantityOfKits(1);
      setEmployeeName('');
      setEmployeeRole('');
      setEmployeeReg('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, kitId, locationId]);

  if (!isOpen || !kit || !loc) return null;

  const maxPossible = report?.maxCompleteKits || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantityOfKits <= 0) {
      setErrorMsg('A quantidade de kits deve ser maior que zero.');
      return;
    }

    if (quantityOfKits > maxPossible) {
      setErrorMsg(`Capacidade máxima disponível nesta localidade é de ${maxPossible} kits completos.`);
      return;
    }

    if (!employeeName.trim()) {
      setErrorMsg('Informe o nome do colaborador ou equipe recebedora.');
      return;
    }

    const res = deliverKit({
      kitId: kit.id,
      locationId: loc.id,
      quantityOfKits,
      employeeName: employeeName.trim(),
      employeeRole: employeeRole.trim() || undefined,
      employeeRegistration: employeeReg.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Erro ao realizar entrega do kit.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Realizar Entrega de Kit Completo Vivo
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                {kit.name} • {loc.name}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-[#2a0042] to-slate-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-300">Capacidade da Base</span>
            <div className="text-sm font-semibold text-slate-200">
              Disponível: <strong className="text-purple-300 font-mono text-base">{maxPossible} kits</strong>
            </div>
          </div>
          <div className="text-right text-xs">
            {report?.limitingItem ? (
              <span className="text-amber-300 font-semibold">
                Gargalo: {report.limitingItem.itemName}
              </span>
            ) : (
              <span className="text-purple-200">Estoque balanceado</span>
            )}
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
          
          {/* Quantity of Kits to Deliver */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Quantidade de Kits a Entregar *</label>
            <input
              type="number"
              min="1"
              max={maxPossible}
              value={quantityOfKits}
              onChange={(e) => setQuantityOfKits(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold text-slate-900 text-base"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Serão deduzidos automaticamente os componentes de cada kit do estoque de {loc.name}.
            </span>
          </div>

          {/* Components summary list */}
          <div className="p-3 bg-[#FAF7FC] rounded-xl border border-purple-100">
            <span className="text-[11px] uppercase font-bold text-[#660099] block mb-1.5">
              Itens que serão baixados (Qtd x {quantityOfKits}):
            </span>
            <div className="space-y-1 text-xs">
              {kit.components.map((comp, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>• {comp.itemName}</span>
                  <strong className="font-mono text-[#660099]">{comp.requiredQuantity * quantityOfKits} {comp.unit}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Nome do Colaborador / Equipe *</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Souza"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Cargo / Função</label>
              <input
                type="text"
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                placeholder="Ex: Técnico de Campo Fibra"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Matrícula / Registro</label>
              <input
                type="text"
                value={employeeReg}
                onChange={(e) => setEmployeeReg(e.target.value)}
                placeholder="Ex: MAT-8841"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Observações da Entrega</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ficha de entrega NR-6 assinada digitalmente."
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
              disabled={maxPossible === 0}
              className="px-6 py-2 bg-[#660099] hover:bg-[#52007a] disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold shadow-sm shadow-purple-950/20 transition-all cursor-pointer"
            >
              Confirmar Entrega do Kit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
