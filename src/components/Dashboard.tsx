import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  Clock, 
  Plus, 
  ChevronRight,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { TabType } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenNewItem: () => void;
  onOpenQuickBatch: () => void;
  onOpenDeliverKit: (kitId: string, locationId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenNewItem,
  onOpenQuickBatch,
  onOpenDeliverKit,
}) => {
  const { 
    items, 
    locations, 
    kits, 
    movements, 
    selectedLocationId, 
    getAllKitsAvailability,
    getKitAvailabilityForLocation 
  } = useStock();

  // Filter items by active location
  const filteredItems = items.filter(item => 
    selectedLocationId === 'ALL' || item.locationId === selectedLocationId
  );

  const activeLocationName = selectedLocationId === 'ALL' 
    ? 'Todas as Localidades' 
    : locations.find(l => l.id === selectedLocationId)?.name || 'Localidade';

  // KPIs
  const totalUnits = filteredItems.reduce((acc, item) => acc + item.quantity, 0);
  const criticalItems = filteredItems.filter(item => item.quantity <= item.minQuantity);
  const zeroItems = filteredItems.filter(item => item.quantity === 0);

  // Today's movements
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMovements = movements.filter(m => {
    const isLoc = selectedLocationId === 'ALL' || m.locationId === selectedLocationId;
    return isLoc && m.createdAt.startsWith(todayStr);
  });

  const todayOutputCount = todayMovements
    .filter(m => m.type === 'SAIDA' || m.type === 'AVARIA')
    .reduce((sum, m) => sum + m.quantity, 0);

  const todayInputCount = todayMovements
    .filter(m => m.type === 'ENTRADA' || m.type === 'DEVOLUCAO')
    .reduce((sum, m) => sum + m.quantity, 0);

  // Kits reports for the selected location or first location
  const targetLocForKits = selectedLocationId === 'ALL' 
    ? (locations[0]?.id || '') 
    : selectedLocationId;

  const kitReports = kits.map(kit => {
    if (!targetLocForKits) return null;
    return getKitAvailabilityForLocation(kit.id, targetLocForKits);
  }).filter(Boolean);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Visão Geral de Almoxarifado
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#660099] border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#660099] animate-pulse"></span>
              {activeLocationName}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Controle de estoque diário, cálculo de kits montáveis e prevenção de falta de EPIs Vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-quick-batch-action"
            onClick={onOpenQuickBatch}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-semibold text-sm shadow-sm shadow-purple-950/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-purple-200" />
            Lançamento Diário (Lote)
          </button>
          
          <button
            id="dash-new-item-action"
            onClick={onOpenNewItem}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-purple-50 text-slate-800 hover:text-[#660099] rounded-xl font-semibold text-sm transition-colors border border-slate-200 hover:border-purple-200"
          >
            <Plus className="w-4 h-4 text-slate-600 group-hover:text-[#660099]" />
            Novo EPI
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Units in Stock */}
        <div className="bg-white rounded-xl p-5 border border-purple-100/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total em Estoque</span>
            <div className="p-2 bg-purple-50 rounded-lg text-[#660099]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalUnits.toLocaleString('pt-BR')}</span>
            <span className="text-xs text-slate-500 font-medium">unidades</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{filteredItems.length} modelos de EPIs</span>
            <button onClick={() => onNavigateTab('items')} className="text-[#660099] hover:underline font-semibold inline-flex items-center">
              Ver lista <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Critical / Low Stock Alert */}
        <div className="bg-white rounded-xl p-5 border border-purple-100/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Alertas de Estoque</span>
            <div className={`p-2 rounded-lg ${criticalItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${criticalItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {criticalItems.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">abaixo do mínimo</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className={zeroItems.length > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
              {zeroItems.length} zerados
            </span>
            {criticalItems.length > 0 && (
              <button onClick={() => onNavigateTab('items')} className="text-rose-600 hover:underline font-semibold inline-flex items-center">
                Repor <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Today's Outputs / Deliveries */}
        <div className="bg-white rounded-xl p-5 border border-purple-100/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Movimentações Hoje</span>
            <div className="p-2 bg-purple-50 rounded-lg text-[#660099]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{todayMovements.length}</span>
            <span className="text-xs text-slate-500 font-medium">registros hoje</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
            <span className="text-[#660099] font-semibold flex items-center gap-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" /> +{todayInputCount} ent.
            </span>
            <span className="text-slate-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> -{todayOutputCount} saídas
            </span>
          </div>
        </div>

        {/* Active Locations & Total Kits */}
        <div className="bg-white rounded-xl p-5 border border-purple-100/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kits Cadastrados</span>
            <div className="p-2 bg-purple-50 rounded-lg text-[#660099]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{kits.length}</span>
            <span className="text-xs text-slate-500 font-medium">composições ativas</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{locations.length} almoxarifados</span>
            <button onClick={() => onNavigateTab('kits')} className="text-[#660099] hover:underline font-semibold inline-flex items-center">
              Analisar <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* SPECIAL REQUIREMENT SPOTLIGHT: AUTOMATIC KIT DISPONIBILITY & BOTTLENECK ANALYSIS */}
      <div className="bg-gradient-to-br from-slate-900 via-[#26003b] to-slate-950 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-purple-950">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-900/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Cálculo Automático de Disponibilidade de Kits
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#9933CC] text-white uppercase tracking-wider shadow-xs">
                  Análise de Gargalo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mostra quantos kits completos é possível montar e aponta exatamente qual item limita a capacidade operacional da Vivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-200 bg-purple-950/80 px-3 py-1.5 rounded-lg border border-purple-800/80">
            <span>Avaliando:</span>
            <strong className="text-purple-300">
              {selectedLocationId === 'ALL' ? (locations[0]?.name || 'Depósito Central') : activeLocationName}
            </strong>
          </div>
        </div>

        {/* Kit Cards Grid with Bottleneck Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kitReports.map((report) => {
            if (!report) return null;
            const kit = kits.find(k => k.id === report.kitId);
            const isZero = report.maxCompleteKits === 0;
            const isLow = report.maxCompleteKits > 0 && report.maxCompleteKits < 15;

            return (
              <div 
                key={report.kitId}
                className="bg-slate-900/90 rounded-xl p-5 border border-purple-900/50 hover:border-purple-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  
                  {/* Kit Title & Capacity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">{kit?.category || 'Kit Operacional'}</span>
                      <h3 className="text-base font-bold text-white leading-tight mt-0.5">{report.kitName}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`px-3 py-1 rounded-xl font-extrabold text-base sm:text-lg flex items-center gap-1.5 ${
                        isZero 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : isLow 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                      }`}>
                        <span>{report.maxCompleteKits}</span>
                        <span className="text-xs font-semibold uppercase opacity-90">Kits</span>
                      </div>
                      <span className="text-[10px] text-slate-400">montáveis hoje</span>
                    </div>
                  </div>

                  {/* Limiting Item / Gargalo Explanation Box */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-purple-900/40 text-xs">
                    {report.limitingItem ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Gargalo Limitante: {report.limitingItem.itemName}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Estoque disponível de apenas <strong className="text-white">{report.limitingItem.availableStock}</strong> (necessário {report.limitingItem.requiredPerKit} por kit). 
                          É este item que limita a capacidade máxima a <strong className="text-amber-300">{report.maxCompleteKits} kits</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-purple-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        <span>Todos os componentes possuem estoque equilibrado.</span>
                      </div>
                    )}
                  </div>

                  {/* Components mini bar list */}
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 flex justify-between">
                      <span>Componentes do Kit</span>
                      <span>Disponível / Necessário</span>
                    </div>
                    {report.componentDetails.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-800/60 border border-purple-950/40">
                        <span className="truncate max-w-[200px] text-slate-300">
                          {comp.itemName}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono font-medium ${comp.isLimiting ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                            {comp.available} {comp.unit}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            (dá p/ {comp.maxKitsForThisItem})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateTab('kits')}
                    className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                  >
                    Ver detalhes completos <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenDeliverKit(report.kitId, report.locationId)}
                    disabled={report.maxCompleteKits === 0}
                    className="px-3.5 py-1.5 bg-[#660099] hover:bg-[#7e00bd] disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Entregar Kit
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Two Column Layout: Critical Stock Items + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Items Column (1/3) */}
        <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-sm">Atenção: Estoque Baixo</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {criticalItems.length} itens
              </span>
            </div>

            {criticalItems.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#660099] mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">Nenhum item em nível crítico!</p>
                <p className="text-xs text-slate-400 mt-0.5">Todos os EPIs estão acima do estoque mínimo de segurança.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalItems.slice(0, 5).map(item => {
                  const loc = locations.find(l => l.id === item.locationId);
                  const isZero = item.quantity === 0;
                  return (
                    <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{item.caNumber} • {loc?.name || 'Local'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            isZero ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.quantity} {item.unit}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">Mín: {item.minQuantity}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('items')}
              className="w-full py-2 text-center text-xs font-bold text-[#660099] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              Gerenciar Todo o Estoque de EPIs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Movements Activity Feed (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-purple-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-slate-900 text-sm">Histórico Recente de Entregas & Movimentações</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('movements')}
                className="text-xs font-semibold text-[#660099] hover:text-[#52007a] flex items-center gap-1"
              >
                Ver Todas ({movements.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {movements.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Nenhuma movimentação registrada até o momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {movements.slice(0, 5).map(mov => {
                  const isOut = mov.type === 'SAIDA' || mov.type === 'AVARIA';
                  const dateFormatted = new Date(mov.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={mov.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isOut ? 'bg-rose-50 text-rose-600' : 'bg-purple-50 text-[#660099]'
                        }`}>
                          {isOut ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{mov.itemName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                              {mov.itemCa}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] truncate mt-0.5">
                            {mov.reason} • <span className="font-medium text-slate-700">{mov.employeeName || 'Almoxarife'}</span>
                          </p>
                          <span className="text-[10px] text-slate-400">{mov.locationName} • {dateFormatted}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-xs ${
                          isOut ? 'text-rose-600' : 'text-[#660099]'
                        }`}>
                          {isOut ? '-' : '+'}{mov.quantity}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Saldo: {mov.currentStock}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Registros consolidados no almoxarifado Vivo</span>
            <button
              onClick={onOpenQuickBatch}
              className="text-[#660099] hover:text-[#52007a] font-bold inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-[#660099]" />
              Lançar fechamento diário agora
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
