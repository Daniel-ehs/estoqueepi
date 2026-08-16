import React from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  User, 
  Phone, 
  Package, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { Location } from '../types';

interface LocationsViewProps {
  onOpenNewLocation: () => void;
  onOpenEditLocation: (location: Location) => void;
  onSelectLocationForViewing: (locationId: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  onOpenNewLocation,
  onOpenEditLocation,
  onSelectLocationForViewing,
}) => {
  const { 
    locations, 
    items, 
    kits, 
    getKitAvailabilityForLocation, 
    deleteLocation,
    isCurrentUserAdmin,
    currentUser
  } = useStock();

  const handleDelete = (location: Location) => {
    if (!isCurrentUserAdmin) {
      alert('Apenas Administradores do sistema podem excluir almoxarifados.');
      return;
    }
    const res = deleteLocation(location.id);
    if (!res.success) {
      alert(res.message || 'Não foi possível excluir esta localidade.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Almoxarifados, Hubs & Canteiros Vivo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#660099] border border-purple-200">
              {locations.length} {locations.length === 1 ? 'local' : 'locais'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie múltiplos pontos físicos de armazenamento de EPIs, bases operacionais e centros de distribuição da Vivo.
          </p>
        </div>

        {isCurrentUserAdmin ? (
          <button
            id="btn-add-new-location"
            onClick={onOpenNewLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-semibold text-sm shadow-sm shadow-purple-950/20 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Almoxarifado / Base
          </button>
        ) : (
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold flex items-center gap-1.5">
            <span>Perfil Atual: <strong>{currentUser.role}</strong></span>
          </div>
        )}
      </div>

      {/* Locations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(loc => {
          const locItems = items.filter(i => i.locationId === loc.id);
          const totalUnits = locItems.reduce((sum, i) => sum + i.quantity, 0);
          const criticalCount = locItems.filter(i => i.quantity <= i.minQuantity).length;

          // Kit capabilities for this location
          const kitsCapabilities = kits.map(k => getKitAvailabilityForLocation(k.id, loc.id)).filter(Boolean);
          const isUserAssigned = currentUser.locationId === loc.id;

          return (
            <div 
              key={loc.id}
              className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${
                isUserAssigned ? 'border-[#660099] ring-1 ring-[#660099]' : 'border-purple-100/90 hover:border-purple-300'
              }`}
            >
              <div>
                
                {/* Header */}
                <div className="p-5 border-b border-purple-50 bg-[#FAF7FC]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">{loc.code}</span>
                          {isUserAssigned && (
                            <span className="text-[9px] font-bold bg-[#660099] text-white px-1.5 py-0.2 rounded-full">
                              Seu Estoque
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{loc.name}</h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{loc.description}</p>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-xs">
                  
                  {/* Address and Responsible */}
                  <div className="space-y-2 text-slate-600">
                    {loc.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{loc.address}</span>
                      </div>
                    )}
                    {loc.responsibleName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Almoxarife: <strong className="text-slate-800">{loc.responsibleName}</strong></span>
                      </div>
                    )}
                    {loc.responsibleContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{loc.responsibleContact}</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-50">
                    <div className="p-2.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total em Estoque</span>
                      <strong className="text-base font-extrabold text-slate-900">{totalUnits}</strong>
                      <span className="text-[10px] text-slate-500 block">{locItems.length} EPIs cadastrados</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF7FC] border border-purple-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Status de Estoque</span>
                      <strong className={`text-base font-extrabold ${criticalCount > 0 ? 'text-amber-600' : 'text-[#660099]'}`}>
                        {criticalCount > 0 ? `${criticalCount} em alerta` : '100% Regular'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">níveis de reposição</span>
                    </div>
                  </div>

                  {/* Top Kits Available here */}
                  <div className="pt-2 border-t border-purple-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      Capacidade de Kits Montáveis
                    </span>
                    <div className="space-y-1.5">
                      {kitsCapabilities.slice(0, 3).map((rep, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-2 rounded bg-slate-50">
                          <span className="text-slate-700 font-medium truncate max-w-[170px]">{rep?.kitName}</span>
                          <span className="font-mono font-bold text-[#660099] bg-purple-100 px-1.5 py-0.2 rounded">
                            {rep?.maxCompleteKits} kits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-3 bg-[#FAF7FC] border-t border-purple-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {isCurrentUserAdmin && (
                    <>
                      <button
                        onClick={() => onOpenEditLocation(loc)}
                        className="p-1.5 text-slate-600 hover:text-[#660099] rounded-lg transition-colors cursor-pointer"
                        title="Editar informações"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Excluir localidade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onSelectLocationForViewing(loc.id)}
                  className="px-3 py-1.5 text-xs font-bold text-[#660099] bg-purple-100/60 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Filtrar Este Estoque <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
