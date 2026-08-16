import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Package, 
  Edit3, 
  Trash2, 
  Calculator, 
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { EpiKit } from '../types';

interface KitsViewProps {
  onOpenNewKit: () => void;
  onOpenEditKit: (kit: EpiKit) => void;
  onOpenDeliverKit: (kitId: string, locationId: string) => void;
}

export const KitsView: React.FC<KitsViewProps> = ({
  onOpenNewKit,
  onOpenEditKit,
  onOpenDeliverKit,
}) => {
  const { 
    kits, 
    locations, 
    items, 
    selectedLocationId, 
    getKitAvailabilityForLocation, 
    deleteKit 
  } = useStock();

  const [activeLocId, setActiveLocId] = useState<string>(() => {
    return selectedLocationId !== 'ALL' ? selectedLocationId : (locations[0]?.id || '');
  });

  const [targetKitsSimulation, setTargetKitsSimulation] = useState<number>(20);
  const [selectedKitForSimulation, setSelectedKitForSimulation] = useState<string>(() => kits[0]?.id || '');

  const activeLocation = locations.find(l => l.id === activeLocId);

  const handleDeleteKit = (kit: EpiKit) => {
    if (window.confirm(`Deseja realmente excluir a composição "${kit.name}" do cadastro Vivo?`)) {
      deleteKit(kit.id);
    }
  };

  // Availability report for the currently inspected kit in simulator
  const simReport = selectedKitForSimulation && activeLocId 
    ? getKitAvailabilityForLocation(selectedKitForSimulation, activeLocId) 
    : null;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Composição de Kits de EPI & Motor de Gargalo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#660099] border border-purple-200">
              Regra de Negócio Especial
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cálculo dinâmico da capacidade máxima de montagem de kits completos com base no item limitante de cada almoxarifado Vivo.
          </p>
        </div>

        <button
          id="btn-create-new-kit"
          onClick={onOpenNewKit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-semibold text-sm shadow-sm shadow-purple-950/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Criar Nova Composição de Kit
        </button>
      </div>

      {/* Location Filter Bar for Kits Analysis */}
      <div className="bg-gradient-to-r from-slate-900 via-[#26003b] to-slate-950 text-white rounded-2xl p-5 border border-purple-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-purple-300 uppercase font-semibold">Almoxarifado Vivo em Análise</span>
            <div className="text-base font-bold text-white mt-0.5">
              {activeLocation?.name || 'Selecione uma localidade'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300 font-medium">Trocar Almoxarifado:</label>
          <select
            id="kits-location-select"
            value={activeLocId}
            onChange={(e) => setActiveLocId(e.target.value)}
            className="px-3 py-2 bg-purple-950 border border-purple-800 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* All Kits Cards with Detailed Component Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kits.map(kit => {
          const report = activeLocId ? getKitAvailabilityForLocation(kit.id, activeLocId) : null;
          if (!report) return null;

          const isZero = report.maxCompleteKits === 0;
          const isLow = report.maxCompleteKits > 0 && report.maxCompleteKits < 15;

          return (
            <div 
              key={kit.id}
              className="bg-white rounded-2xl border border-purple-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                
                {/* Kit Header Banner */}
                <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#660099] bg-purple-100 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider">
                        {kit.category || 'Kit Padrão'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{kit.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{kit.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{kit.description}</p>
                  </div>

                  {/* Big Highlight Capacity Badge */}
                  <div className="text-right shrink-0">
                    <div className={`px-4 py-2 rounded-2xl font-black text-xl sm:text-2xl shadow-xs flex items-center gap-2 ${
                      isZero 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : isLow 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-purple-100 text-[#660099] border border-purple-300'
                    }`}>
                      <span>{report.maxCompleteKits}</span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">Kits</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 block">Capacidade Máxima</span>
                  </div>
                </div>

                {/* Bottleneck Critical Alert Box */}
                <div className="p-5 space-y-4">
                  {report.limitingItem ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Item Gargalo / Limitante: {report.limitingItem.itemName}</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        Existe saldo para montar apenas <strong className="text-amber-950 font-extrabold">{report.maxCompleteKits} kits completos</strong> nesta localidade 
                        porque o estoque deste EPI possui apenas <strong className="text-amber-950">{report.limitingItem.availableStock} unidades</strong> disponíveis (necessário {report.limitingItem.requiredPerKit} por kit).
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-[#660099] flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#660099] shrink-0" />
                      <span>Estoque de todos os itens encontra-se balanceado sem gargalos críticos imediatos.</span>
                    </div>
                  )}

                  {/* Components Breakdown Table */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      <span>Composição & Saldo dos Itens</span>
                      <span>Disponibilidade Unitária</span>
                    </div>

                    <div className="space-y-2">
                      {report.componentDetails.map((comp, idx) => {
                        const isLimiter = comp.isLimiting;

                        return (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                              isLimiter 
                                ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/60' 
                                : 'bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 truncate">{comp.itemName}</span>
                                {isLimiter && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-amber-200 text-amber-900 shrink-0">
                                    Gargalo
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                Requer: <strong className="text-slate-700">{comp.required} {comp.unit}</strong> por kit • CA: {comp.caNumber}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="flex items-center sm:justify-end gap-2">
                                <span className="text-slate-500">Saldo:</span>
                                <span className={`font-mono font-extrabold text-sm ${isLimiter ? 'text-amber-900' : 'text-slate-900'}`}>
                                  {comp.available} {comp.unit}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Suficiente para <strong className="text-slate-800">{comp.maxKitsForThisItem} kits</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#FAF7FC] border-t border-purple-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditKit(kit)}
                    className="p-2 text-slate-600 hover:text-[#660099] hover:bg-purple-100/50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Editar componentes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteKit(kit)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs transition-colors"
                    title="Excluir kit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenDeliverKit(kit.id, activeLocId)}
                  disabled={report.maxCompleteKits === 0}
                  className="px-4 py-2 bg-[#660099] hover:bg-[#52007a] disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Realizar Entrega Deste Kit
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Interactive Simulator: "Quantos itens faltam para montar X kits?" */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-purple-50 pb-3">
          <div className="p-2 rounded-lg bg-purple-50 text-[#660099]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Simulador de Meta & Planejamento de Compras de EPIs Vivo</h3>
            <p className="text-xs text-slate-500">
              Calcule quantos itens adicionais de cada EPI você precisa comprar para atender a uma meta de novos colaboradores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Selecione o Kit</label>
            <select
              value={selectedKitForSimulation}
              onChange={(e) => setSelectedKitForSimulation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099]"
            >
              {kits.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Localidade / Almoxarifado</label>
            <select
              value={activeLocId}
              onChange={(e) => setActiveLocId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099]"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Meta de Kits Desejada</label>
            <input
              type="number"
              min="1"
              max="5000"
              value={targetKitsSimulation}
              onChange={(e) => setTargetKitsSimulation(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold"
            />
          </div>
        </div>

        {simReport && (
          <div className="mt-4 pt-4 border-t border-purple-50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                Capacidade atual: <strong className="text-[#660099]">{simReport.maxCompleteKits} kits</strong> • Meta: <strong className="text-slate-900">{targetKitsSimulation} kits</strong>
              </span>
              <span className="font-bold text-slate-500">Déficit por Componente:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {simReport.componentDetails.map((comp, i) => {
                const neededTotal = comp.required * targetKitsSimulation;
                const deficit = Math.max(0, neededTotal - comp.available);
                const isSatisfied = deficit === 0;

                return (
                  <div key={i} className={`p-3 rounded-xl border text-xs ${
                    isSatisfied ? 'bg-purple-50/60 border-purple-200' : 'bg-rose-50/70 border-rose-200'
                  }`}>
                    <div className="font-bold text-slate-800 truncate">{comp.itemName}</div>
                    <div className="mt-2 flex justify-between text-[11px]">
                      <span className="text-slate-500">Saldo: {comp.available}</span>
                      <span className="text-slate-500">Necessário: {neededTotal}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Falta Comprar:</span>
                      <strong className={`font-mono text-sm ${isSatisfied ? 'text-[#660099]' : 'text-rose-700 font-extrabold'}`}>
                        {isSatisfied ? '0 (OK)' : `+${deficit} ${comp.unit}`}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
