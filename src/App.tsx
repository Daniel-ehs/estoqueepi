import React, { useState } from 'react';
import { StockProvider, useStock } from './context/StockContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ItemsView } from './components/ItemsView';
import { MovementsView } from './components/MovementsView';
import { KitsView } from './components/KitsView';
import { LocationsView } from './components/LocationsView';
import { UsersView } from './components/UsersView';

// Modals
import { ItemModal } from './components/modals/ItemModal';
import { LocationModal } from './components/modals/LocationModal';
import { KitModal } from './components/modals/KitModal';
import { QuickMovementModal } from './components/modals/QuickMovementModal';
import { TransferModal } from './components/modals/TransferModal';
import { KitDeliveryModal } from './components/modals/KitDeliveryModal';
import { UserModal } from './components/modals/UserModal';
import { LoginView } from './components/LoginView';
import { EpiItem, EpiKit, Location, AppUser, TabType } from './types';

function MainAppContent() {
  const { setSelectedLocationId, currentUser } = useStock();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<EpiItem | null>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);

  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [kitToEdit, setKitToEdit] = useState<EpiKit | null>(null);

  const [isQuickMovementModalOpen, setIsQuickMovementModalOpen] = useState(false);
  const [itemForQuickMovement, setItemForQuickMovement] = useState<EpiItem | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [itemForTransfer, setItemForTransfer] = useState<EpiItem | null>(null);

  const [isKitDeliveryModalOpen, setIsKitDeliveryModalOpen] = useState(false);
  const [deliveryKitId, setDeliveryKitId] = useState<string | null>(null);
  const [deliveryLocationId, setDeliveryLocationId] = useState<string | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);

  // Handlers
  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: EpiItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleOpenNewLocation = () => {
    setLocationToEdit(null);
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (location: Location) => {
    setLocationToEdit(location);
    setIsLocationModalOpen(true);
  };

  const handleOpenNewKit = () => {
    setKitToEdit(null);
    setIsKitModalOpen(true);
  };

  const handleOpenEditKit = (kit: EpiKit) => {
    setKitToEdit(kit);
    setIsKitModalOpen(true);
  };

  const handleOpenQuickMovement = (item: EpiItem) => {
    setItemForQuickMovement(item);
    setIsQuickMovementModalOpen(true);
  };

  const handleOpenTransfer = (item: EpiItem) => {
    setItemForTransfer(item);
    setIsTransferModalOpen(true);
  };

  const handleOpenDeliverKit = (kitId: string, locationId: string) => {
    setDeliveryKitId(kitId);
    setDeliveryLocationId(locationId);
    setIsKitDeliveryModalOpen(true);
  };

  const handleSelectLocationForViewing = (locationId: string) => {
    setSelectedLocationId(locationId);
    setActiveTab('items');
  };

  const handleOpenNewUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AppUser) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9FD] text-slate-800 font-sans flex flex-col selection:bg-[#660099] selection:text-white">
      
      {/* Top Header */}
      <Header
        onToggleSidebar={() => {
          if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }
        }}
        onNavigateUsers={() => setActiveTab('users')}
      />

      {/* Main Body Layout with Collapsible Sidebar */}
      <div className="flex-1 flex">
        
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onOpenQuickBatchModal={() => setActiveTab('movements')}
        />

        {/* Content Area with dynamic left margin matching sidebar width */}
        <div 
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                onNavigateTab={setActiveTab}
                onOpenNewItem={handleOpenNewItem}
                onOpenQuickBatch={() => setActiveTab('movements')}
                onOpenDeliverKit={handleOpenDeliverKit}
              />
            )}

            {activeTab === 'items' && (
              <ItemsView
                onOpenNewItem={handleOpenNewItem}
                onOpenEditItem={handleOpenEditItem}
                onOpenQuickMovement={handleOpenQuickMovement}
                onOpenTransfer={handleOpenTransfer}
              />
            )}

            {activeTab === 'movements' && (
              <MovementsView />
            )}

            {activeTab === 'kits' && (
              <KitsView
                onOpenNewKit={handleOpenNewKit}
                onOpenEditKit={handleOpenEditKit}
                onOpenDeliverKit={handleOpenDeliverKit}
              />
            )}

            {activeTab === 'locations' && (
              <LocationsView
                onOpenNewLocation={handleOpenNewLocation}
                onOpenEditLocation={handleOpenEditLocation}
                onSelectLocationForViewing={handleSelectLocationForViewing}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                onOpenNewUser={handleOpenNewUser}
                onOpenEditUser={handleOpenEditUser}
              />
            )}
          </main>

          {/* Footer with Vivo theme styling */}
          <footer className="bg-slate-900 border-t border-purple-950 text-slate-400 py-6 mt-auto text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#660099] flex items-center justify-center text-white text-[10px] font-extrabold">
                  V
                </div>
                <span className="font-bold text-white">Vivo EPI Control Pro</span>
                <span className="text-slate-500">— Controle de Estoque & Múltiplos Almoxarifados</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Sessão: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
                </span>
                <span>•</span>
                <span>Lotes Diários</span>
                <span>•</span>
                <span>Cálculo de Gargalo</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        locationToEdit={locationToEdit}
      />

      <KitModal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
        kitToEdit={kitToEdit}
      />

      <QuickMovementModal
        isOpen={isQuickMovementModalOpen}
        onClose={() => setIsQuickMovementModalOpen(false)}
        item={itemForQuickMovement}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        item={itemForTransfer}
      />

      <KitDeliveryModal
        isOpen={isKitDeliveryModalOpen}
        onClose={() => setIsKitDeliveryModalOpen(false)}
        kitId={deliveryKitId}
        locationId={deliveryLocationId}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
      />

    </div>
  );
}

function RootApp() {
  const { isAuthenticated } = useStock();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainAppContent />;
}

export default function App() {
  return (
    <StockProvider>
      <RootApp />
    </StockProvider>
  );
}
