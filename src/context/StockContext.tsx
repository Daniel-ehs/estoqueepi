import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Location, 
  EpiItem, 
  EpiKit, 
  StockMovement, 
  MovementType, 
  KitAvailability, 
  KitLimitingItem,
  BatchMovementEntry,
  AppUser,
  UserRole
} from '../types';
import { INITIAL_LOCATIONS, INITIAL_EPIS, INITIAL_KITS, INITIAL_MOVEMENTS, INITIAL_USERS } from '../data/initialData';

interface StockContextType {
  locations: Location[];
  items: EpiItem[];
  kits: EpiKit[];
  movements: StockMovement[];
  users: AppUser[];
  currentUserId: string;
  currentUser: AppUser;
  selectedLocationId: string | 'ALL';
  setSelectedLocationId: (id: string | 'ALL') => void;
  
  // Authentication
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;

  // User Management & Roles
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => AppUser;
  updateUser: (id: string, user: Partial<AppUser>) => void;
  deleteUser: (id: string) => { success: boolean; message?: string };
  setCurrentUserId: (id: string) => void;
  
  // Permission & Role Checkers
  isCurrentUserAdmin: boolean;
  isCurrentUserController: boolean;
  isCurrentUserViewer: boolean;
  canEditStock: (targetLocationId?: string) => boolean;
  canManageUsers: boolean;
  canManageLocations: boolean;
  userAccessibleLocations: Location[];

  // Location CRUD
  addLocation: (location: Omit<Location, 'id' | 'createdAt'>) => Location;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => { success: boolean; message?: string };
  
  // Items CRUD & Operations
  addItem: (item: Omit<EpiItem, 'id' | 'updatedAt'>) => EpiItem;
  updateItem: (id: string, item: Partial<EpiItem>) => void;
  deleteItem: (id: string) => void;
  
  // Movements
  registerSingleMovement: (params: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    employeeName?: string;
    employeeRole?: string;
    employeeRegistration?: string;
    notes?: string;
    customDate?: string;
  }) => { success: boolean; error?: string };
  
  registerBatchMovement: (params: {
    locationId: string;
    entries: BatchMovementEntry[];
    reason: string;
    employeeName?: string;
    employeeRole?: string;
    employeeRegistration?: string;
    isDailyClosing?: boolean;
    customDate?: string;
    notes?: string;
  }) => { success: boolean; count: number; error?: string };

  transferStock: (params: {
    sourceItemId: string;
    targetLocationId: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  
  // Kits CRUD & Logic
  addKit: (kit: Omit<EpiKit, 'id' | 'createdAt' | 'updatedAt'>) => EpiKit;
  updateKit: (id: string, kit: Partial<EpiKit>) => void;
  deleteKit: (id: string) => void;
  deliverKit: (params: {
    kitId: string;
    locationId: string;
    quantityOfKits: number;
    employeeName?: string;
    employeeRole?: string;
    employeeRegistration?: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  
  // Kit Availability Calculations
  getKitAvailabilityForLocation: (kitId: string, locationId: string) => KitAvailability | null;
  getAllKitsAvailability: (locationId?: string) => KitAvailability[];
  
  // System Tools
  resetToDefaultData: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;
}

const LOCAL_STORAGE_KEY_LOCATIONS = 'epi_stock_locations_v1';
const LOCAL_STORAGE_KEY_ITEMS = 'epi_stock_items_v1';
const LOCAL_STORAGE_KEY_KITS = 'epi_stock_kits_v1';
const LOCAL_STORAGE_KEY_MOVEMENTS = 'epi_stock_movements_v1';
const LOCAL_STORAGE_KEY_SELECTED_LOC = 'epi_stock_selected_loc_v1';
const LOCAL_STORAGE_KEY_USERS = 'epi_stock_users_v1';
const LOCAL_STORAGE_KEY_CURRENT_USER_ID = 'epi_stock_current_user_id_v1';
const LOCAL_STORAGE_KEY_IS_AUTH = 'epi_stock_is_authenticated_v1';

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_IS_AUTH);
      return saved !== null ? saved === 'true' : false; // Default to showing login or can be set
    } catch {
      return false;
    }
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER_ID);
      return saved || 'user-1';
    } catch {
      return 'user-1';
    }
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOCATIONS);
      return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    } catch {
      return INITIAL_LOCATIONS;
    }
  });

  const [items, setItems] = useState<EpiItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_EPIS;
    } catch {
      return INITIAL_EPIS;
    }
  });

  const [kits, setKits] = useState<EpiKit[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_KITS);
      return saved ? JSON.parse(saved) : INITIAL_KITS;
    } catch {
      return INITIAL_KITS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string | 'ALL'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOC);
      return saved || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  // Current active user
  const currentUser: AppUser = useMemo(() => {
    const found = users.find(u => u.id === currentUserId);
    return found || users[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  const isCurrentUserAdmin = currentUser.role === 'ADMIN';
  const isCurrentUserController = currentUser.role === 'CONTROLLER';
  const isCurrentUserViewer = currentUser.role === 'VIEWER';

  // Determine which locations this user can see
  const userAccessibleLocations = useMemo(() => {
    if (isCurrentUserAdmin || currentUser.locationId === 'ALL') {
      return locations;
    }
    return locations.filter(l => l.id === currentUser.locationId);
  }, [locations, isCurrentUserAdmin, currentUser.locationId]);

  // If controller is locked to a specific warehouse, keep selectedLocationId in sync
  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    const targetUser = users.find(u => u.id === id);
    if (targetUser && targetUser.locationId !== 'ALL') {
      setSelectedLocationId(targetUser.locationId);
    }
  };

  // Check if current user has permission to edit stock for a location
  const canEditStock = (targetLocationId?: string): boolean => {
    if (isCurrentUserViewer) return false;
    if (isCurrentUserAdmin) return true;
    if (isCurrentUserController) {
      if (currentUser.locationId === 'ALL') return true;
      if (!targetLocationId) return true;
      return currentUser.locationId === targetLocationId;
    }
    return false;
  };

  const canManageUsers = isCurrentUserAdmin;
  const canManageLocations = isCurrentUserAdmin;

  // Authentication logic
  const login = (userId: string) => {
    setCurrentUserIdState(userId);
    setIsAuthenticated(true);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.locationId !== 'ALL') {
      setSelectedLocationId(targetUser.locationId);
    } else {
      setSelectedLocationId('ALL');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_IS_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_KITS, JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_LOC, selectedLocationId);
  }, [selectedLocationId]);

  // User CRUD
  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>): AppUser => {
    const newUser: AppUser = {
      ...userData,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updated: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  };

  const deleteUser = (id: string) => {
    if (id === currentUserId) {
      return { success: false, message: 'Você não pode excluir o usuário com a sessão atualmente ativa.' };
    }
    if (users.length <= 1) {
      return { success: false, message: 'O sistema deve possuir ao menos um usuário cadastrado.' };
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    return { success: true };
  };

  // Location CRUD
  const addLocation = (locationData: Omit<Location, 'id' | 'createdAt'>): Location => {
    const newLoc: Location = {
      ...locationData,
      id: 'loc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setLocations(prev => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id: string, updated: Partial<Location>) => {
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, ...updated } : loc));
  };

  const deleteLocation = (id: string) => {
    const hasItems = items.some(item => item.locationId === id);
    if (hasItems) {
      return { success: false, message: 'Não é possível excluir uma localidade que possui itens cadastrados em seu estoque.' };
    }
    setLocations(prev => prev.filter(loc => loc.id !== id));
    if (selectedLocationId === id) {
      setSelectedLocationId('ALL');
    }
    return { success: true };
  };

  const addItem = (itemData: Omit<EpiItem, 'id' | 'updatedAt'>): EpiItem => {
    const newItem: EpiItem = {
      ...itemData,
      id: 'epi-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);

    // Initial movement log if quantity > 0
    if (newItem.quantity > 0) {
      const loc = locations.find(l => l.id === newItem.locationId);
      const initMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        itemId: newItem.id,
        itemName: newItem.name,
        itemCa: newItem.caNumber,
        locationId: newItem.locationId,
        locationName: loc ? loc.name : 'Localidade',
        type: 'ENTRADA',
        quantity: newItem.quantity,
        previousStock: 0,
        currentStock: newItem.quantity,
        reason: 'Cadastro Inicial de Item no Sistema',
        employeeName: 'Sistema Almoxarifado',
        createdAt: new Date().toISOString(),
      };
      setMovements(prev => [initMovement, ...prev]);
    }

    return newItem;
  };

  const updateItem = (id: string, updated: Partial<EpiItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updated, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const registerSingleMovement = (params: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    employeeName?: string;
    employeeRole?: string;
    employeeRegistration?: string;
    notes?: string;
    customDate?: string;
  }) => {
    const targetItem = items.find(i => i.id === params.itemId);
    if (!targetItem) {
      return { success: false, error: 'Item não encontrado no estoque.' };
    }

    if (params.quantity <= 0) {
      return { success: false, error: 'A quantidade deve ser maior que zero.' };
    }

    const isSubtraction = params.type === 'SAIDA' || params.type === 'AVARIA';
    
    if (isSubtraction && targetItem.quantity < params.quantity) {
      return { 
        success: false, 
        error: `Saldo insuficiente em estoque. Disponível: ${targetItem.quantity} ${targetItem.unit}, Solicitado: ${params.quantity} ${targetItem.unit}.` 
      };
    }

    const previousStock = targetItem.quantity;
    const newStock = isSubtraction 
      ? previousStock - params.quantity 
      : previousStock + params.quantity;

    const loc = locations.find(l => l.id === targetItem.locationId);

    const newMovement: StockMovement = {
      id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemCa: targetItem.caNumber,
      locationId: targetItem.locationId,
      locationName: loc ? loc.name : 'Localidade',
      type: params.type,
      quantity: params.quantity,
      previousStock,
      currentStock: newStock,
      reason: params.reason,
      employeeName: params.employeeName || 'Almoxarifado',
      employeeRole: params.employeeRole,
      employeeRegistration: params.employeeRegistration,
      notes: params.notes,
      createdAt: params.customDate || new Date().toISOString(),
    };

    // Update item stock
    setItems(prev => prev.map(item => item.id === targetItem.id ? { ...item, quantity: newStock, updatedAt: new Date().toISOString() } : item));
    setMovements(prev => [newMovement, ...prev]);

    return { success: true };
  };

  const registerBatchMovement = (params: {
    locationId: string;
    entries: BatchMovementEntry[];
    reason: string;
    employeeName?: string;
    employeeRole?: string;
    employeeRegistration?: string;
    isDailyClosing?: boolean;
    customDate?: string;
    notes?: string;
  }) => {
    const loc = locations.find(l => l.id === params.locationId);
    if (!loc) {
      return { success: false, count: 0, error: 'Localidade não encontrada.' };
    }

    const validEntries = params.entries.filter(e => e.quantity > 0);
    if (validEntries.length === 0) {
      return { success: false, count: 0, error: 'Nenhum item com quantidade informada para movimentação.' };
    }

    // Validate if any subtraction exceeds stock
    for (const entry of validEntries) {
      const item = items.find(i => i.id === entry.itemId && i.locationId === params.locationId);
      if (!item) {
        return { success: false, count: 0, error: `Item com ID ${entry.itemId} não encontrado nesta localidade.` };
      }
      const isSub = entry.type === 'SAIDA' || entry.type === 'AVARIA';
      if (isSub && item.quantity < entry.quantity) {
        return { 
          success: false, 
          count: 0, 
          error: `Estoque insuficiente para "${item.name}". Disponível: ${item.quantity} ${item.unit}, Solicitado: ${entry.quantity}.` 
        };
      }
    }

    const batchId = 'batch-' + Date.now();
    const createdMovements: StockMovement[] = [];
    const updatedStockMap = new Map<string, number>();

    const timestamp = params.customDate || new Date().toISOString();

    for (const entry of validEntries) {
      const item = items.find(i => i.id === entry.itemId && i.locationId === params.locationId)!;
      const isSub = entry.type === 'SAIDA' || entry.type === 'AVARIA';
      const previousStock = updatedStockMap.has(item.id) ? updatedStockMap.get(item.id)! : item.quantity;
      const currentStock = isSub ? previousStock - entry.quantity : previousStock + entry.quantity;

      updatedStockMap.set(item.id, currentStock);

      const mov: StockMovement = {
        id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        itemId: item.id,
        itemName: item.name,
        itemCa: item.caNumber,
        locationId: loc.id,
        locationName: loc.name,
        type: entry.type,
        quantity: entry.quantity,
        previousStock,
        currentStock,
        reason: params.isDailyClosing 
          ? `Fechamento Diário de Almoxarifado: ${params.reason}` 
          : params.reason,
        employeeName: params.employeeName || (params.isDailyClosing ? 'Fechamento Diário Consolidado' : 'Almoxarife'),
        employeeRole: params.employeeRole,
        employeeRegistration: params.employeeRegistration,
        batchSessionId: batchId,
        notes: entry.notes || params.notes,
        createdAt: timestamp,
      };

      createdMovements.push(mov);
    }

    // Apply all updates
    setItems(prev => prev.map(item => {
      if (updatedStockMap.has(item.id)) {
        return { ...item, quantity: updatedStockMap.get(item.id)!, updatedAt: timestamp };
      }
      return item;
    }));

    setMovements(prev => [...createdMovements, ...prev]);

    return { success: true, count: createdMovements.length };
  };

  const transferStock = (params: {
    sourceItemId: string;
    targetLocationId: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    const sourceItem = items.find(i => i.id === params.sourceItemId);
    if (!sourceItem) return { success: false, error: 'Item de origem não encontrado.' };
    if (sourceItem.locationId === params.targetLocationId) {
      return { success: false, error: 'A localidade de destino deve ser diferente da localidade de origem.' };
    }
    if (params.quantity <= 0 || sourceItem.quantity < params.quantity) {
      return { success: false, error: `Quantidade inválida. Saldo atual: ${sourceItem.quantity} ${sourceItem.unit}.` };
    }

    const sourceLoc = locations.find(l => l.id === sourceItem.locationId);
    const targetLoc = locations.find(l => l.id === params.targetLocationId);
    if (!targetLoc) return { success: false, error: 'Localidade de destino não encontrada.' };

    // Find or create target item in target location
    let targetItem = items.find(i => 
      i.locationId === params.targetLocationId && 
      (i.caNumber === sourceItem.caNumber || i.name.toLowerCase() === sourceItem.name.toLowerCase())
    );

    const now = new Date().toISOString();
    const batchId = 'transf-' + Date.now();

    // 1. Output from source
    const prevSourceStock = sourceItem.quantity;
    const newSourceStock = prevSourceStock - params.quantity;

    const outMovement: StockMovement = {
      id: 'mov-out-' + Date.now(),
      itemId: sourceItem.id,
      itemName: sourceItem.name,
      itemCa: sourceItem.caNumber,
      locationId: sourceItem.locationId,
      locationName: sourceLoc ? sourceLoc.name : 'Origem',
      type: 'SAIDA',
      quantity: params.quantity,
      previousStock: prevSourceStock,
      currentStock: newSourceStock,
      reason: `Transferência enviada para: ${targetLoc.name} (${params.reason})`,
      employeeName: 'Transferência entre Almoxarifados',
      batchSessionId: batchId,
      notes: params.notes,
      createdAt: now,
    };

    let updatedItemsList = items.map(it => it.id === sourceItem.id ? { ...it, quantity: newSourceStock, updatedAt: now } : it);

    if (targetItem) {
      const prevTargetStock = targetItem.quantity;
      const newTargetStock = prevTargetStock + params.quantity;

      const inMovement: StockMovement = {
        id: 'mov-in-' + Date.now(),
        itemId: targetItem.id,
        itemName: targetItem.name,
        itemCa: targetItem.caNumber,
        locationId: targetLoc.id,
        locationName: targetLoc.name,
        type: 'ENTRADA',
        quantity: params.quantity,
        previousStock: prevTargetStock,
        currentStock: newTargetStock,
        reason: `Transferência recebida de: ${sourceLoc?.name || 'Origem'} (${params.reason})`,
        employeeName: 'Transferência entre Almoxarifados',
        batchSessionId: batchId,
        notes: params.notes,
        createdAt: now,
      };

      updatedItemsList = updatedItemsList.map(it => it.id === targetItem!.id ? { ...it, quantity: newTargetStock, updatedAt: now } : it);
      setMovements(prev => [outMovement, inMovement, ...prev]);
    } else {
      // Create copy in target location
      const newCreatedTargetItem: EpiItem = {
        ...sourceItem,
        id: 'epi-' + Date.now() + '-dest',
        locationId: targetLoc.id,
        quantity: params.quantity,
        updatedAt: now,
      };

      const inMovement: StockMovement = {
        id: 'mov-in-' + Date.now(),
        itemId: newCreatedTargetItem.id,
        itemName: newCreatedTargetItem.name,
        itemCa: newCreatedTargetItem.caNumber,
        locationId: targetLoc.id,
        locationName: targetLoc.name,
        type: 'ENTRADA',
        quantity: params.quantity,
        previousStock: 0,
        currentStock: params.quantity,
        reason: `Transferência recebida de: ${sourceLoc?.name || 'Origem'} (Novo Cadastro na Obra)`,
        employeeName: 'Transferência entre Almoxarifados',
        batchSessionId: batchId,
        notes: params.notes,
        createdAt: now,
      };

      updatedItemsList = [newCreatedTargetItem, ...updatedItemsList];
      setMovements(prev => [outMovement, inMovement, ...prev]);
    }

    setItems(updatedItemsList);
    return { success: true };
  };

  // Kits Management & Availability Calculations
  const addKit = (kitData: Omit<EpiKit, 'id' | 'createdAt' | 'updatedAt'>): EpiKit => {
    const newKit: EpiKit = {
      ...kitData,
      id: 'kit-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKits(prev => [...prev, newKit]);
    return newKit;
  };

  const updateKit = (id: string, updated: Partial<EpiKit>) => {
    setKits(prev => prev.map(k => k.id === id ? { ...k, ...updated, updatedAt: new Date().toISOString() } : k));
  };

  const deleteKit = (id: string) => {
    setKits(prev => prev.filter(k => k.id !== id));
  };

  // Find corresponding item in a specific location
  const findItemForComponentInLocation = (component: { itemId: string; itemName: string }, locationId: string): EpiItem | undefined => {
    // 1. Direct ID match
    const direct = items.find(i => i.id === component.itemId && i.locationId === locationId);
    if (direct) return direct;

    // 2. Lookup original item's CA or Name to match equivalent in this location
    const templateItem = items.find(i => i.id === component.itemId);
    if (templateItem) {
      const matchByCa = items.find(i => i.locationId === locationId && i.caNumber === templateItem.caNumber);
      if (matchByCa) return matchByCa;

      const matchByName = items.find(i => i.locationId === locationId && i.name.toLowerCase() === templateItem.name.toLowerCase());
      if (matchByName) return matchByName;
    }

    // 3. Match by component name
    return items.find(i => i.locationId === locationId && i.name.toLowerCase().includes(component.itemName.toLowerCase()));
  };

  // Core business logic: Bottle-neck / Limiting Item & Max Complete Kits Calculation
  const getKitAvailabilityForLocation = (kitId: string, locationId: string): KitAvailability | null => {
    const kit = kits.find(k => k.id === kitId);
    const loc = locations.find(l => l.id === locationId);
    if (!kit || !loc) return null;

    if (kit.components.length === 0) {
      return {
        kitId: kit.id,
        kitName: kit.name,
        locationId: loc.id,
        locationName: loc.name,
        maxCompleteKits: 0,
        limitingItem: null,
        componentDetails: [],
      };
    }

    let minPossibleKits = Infinity;
    let limitingItemData: KitLimitingItem | null = null;

    const componentDetails = kit.components.map(comp => {
      const matchedItem = findItemForComponentInLocation(comp, locationId);
      const available = matchedItem ? matchedItem.quantity : 0;
      const caNumber = matchedItem ? matchedItem.caNumber : (items.find(i => i.id === comp.itemId)?.caNumber || 'N/A');
      const itemId = matchedItem ? matchedItem.id : comp.itemId;

      const maxKitsForThisItem = Math.floor(available / comp.requiredQuantity);

      if (maxKitsForThisItem < minPossibleKits) {
        minPossibleKits = maxKitsForThisItem;
      }

      return {
        itemId,
        itemName: comp.itemName,
        caNumber,
        required: comp.requiredQuantity,
        available,
        maxKitsForThisItem,
        isLimiting: false, // will update below
        unit: comp.unit,
      };
    });

    const maxCompleteKits = minPossibleKits === Infinity ? 0 : Math.max(0, minPossibleKits);

    // Mark limiting items
    let primaryLimiting: KitLimitingItem | null = null;
    componentDetails.forEach(cd => {
      if (cd.maxKitsForThisItem === maxCompleteKits) {
        cd.isLimiting = true;
        if (!primaryLimiting) {
          primaryLimiting = {
            itemId: cd.itemId,
            itemName: cd.itemName,
            caNumber: cd.caNumber,
            availableStock: cd.available,
            requiredPerKit: cd.required,
            maxKitsPossible: maxCompleteKits,
          };
        }
      }
    });

    return {
      kitId: kit.id,
      kitName: kit.name,
      locationId: loc.id,
      locationName: loc.name,
      maxCompleteKits,
      limitingItem: primaryLimiting,
      componentDetails,
    };
  };

  const getAllKitsAvailability = (locationId?: string): KitAvailability[] => {
    const targetLocIds = locationId && locationId !== 'ALL' 
      ? [locationId] 
      : locations.map(l => l.id);

    const reports: KitAvailability[] = [];

    kits.forEach(kit => {
      targetLocIds.forEach(locId => {
        const report = getKitAvailabilityForLocation(kit.id, locId);
        if (report) {
          reports.push(report);
        }
      });
    });

    return reports;
  };

  const deliverKit = (params: {
    kitId: string;
    locationId: string;
    quantityOfKits: number;
    employeeName: string;
    employeeRole?: string;
    employeeRegistration?: string;
    notes?: string;
  }) => {
    const availability = getKitAvailabilityForLocation(params.kitId, params.locationId);
    if (!availability) {
      return { success: false, error: 'Kit ou localidade inválida.' };
    }

    if (params.quantityOfKits <= 0) {
      return { success: false, error: 'A quantidade de kits deve ser maior que zero.' };
    }

    if (availability.maxCompleteKits < params.quantityOfKits) {
      return { 
        success: false, 
        error: `Não é possível entregar ${params.quantityOfKits} kits. Capacidade máxima atual nesta localidade: ${availability.maxCompleteKits} kits devido ao item limitante "${availability.limitingItem?.itemName || 'Itens'}".` 
      };
    }

    // Build batch entries
    const kit = kits.find(k => k.id === params.kitId)!;
    const entries: BatchMovementEntry[] = [];

    for (const comp of kit.components) {
      const item = findItemForComponentInLocation(comp, params.locationId);
      if (!item) {
        return { success: false, error: `Item "${comp.itemName}" não encontrado no estoque desta localidade.` };
      }
      entries.push({
        itemId: item.id,
        quantity: comp.requiredQuantity * params.quantityOfKits,
        type: 'SAIDA',
        notes: `Componente do ${kit.name} (Qtd entregue: ${params.quantityOfKits} kits)`,
      });
    }

    const res = registerBatchMovement({
      locationId: params.locationId,
      entries,
      reason: `Entrega de ${params.quantityOfKits}x ${kit.name}`,
      employeeName: params.employeeName,
      employeeRole: params.employeeRole,
      employeeRegistration: params.employeeRegistration,
      notes: params.notes,
    });

    return res;
  };

  // Reset and Backup
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserIdState('user-1');
    setLocations(INITIAL_LOCATIONS);
    setItems(INITIAL_EPIS);
    setKits(INITIAL_KITS);
    setMovements(INITIAL_MOVEMENTS);
    setSelectedLocationId('ALL');
    localStorage.clear();
  };

  const exportBackupJSON = () => {
    const data = {
      users,
      locations,
      items,
      kits,
      movements,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.locations && parsed.items && parsed.kits && parsed.movements) {
        if (parsed.users && Array.isArray(parsed.users)) {
          setUsers(parsed.users);
        }
        setLocations(parsed.locations);
        setItems(parsed.items);
        setKits(parsed.kits);
        setMovements(parsed.movements);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <StockContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        locations,
        items,
        kits,
        movements,
        users,
        currentUserId,
        currentUser,
        selectedLocationId,
        setSelectedLocationId,
        addUser,
        updateUser,
        deleteUser,
        setCurrentUserId,
        isCurrentUserAdmin,
        isCurrentUserController,
        isCurrentUserViewer,
        canEditStock,
        canManageUsers,
        canManageLocations,
        userAccessibleLocations,
        addLocation,
        updateLocation,
        deleteLocation,
        addItem,
        updateItem,
        deleteItem,
        registerSingleMovement,
        registerBatchMovement,
        transferStock,
        addKit,
        updateKit,
        deleteKit,
        deliverKit,
        getKitAvailabilityForLocation,
        getAllKitsAvailability,
        resetToDefaultData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = (): StockContextType => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
