import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'hydra-catalog-selection';

export type CatalogStagedPart = {
  id: string;
  partKey: string;
  partSku: string;
  title: string;
};

type SelectionStore = {
  items: CatalogStagedPart[];
  drawerOpen: boolean;
};

function normalizeItems(raw: unknown): CatalogStagedPart[] {
  if (!raw || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  const arr = Array.isArray(o.items) ? o.items : [];
  const normalized: CatalogStagedPart[] = [];
  for (const row of arr) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    if (
      typeof r.id === 'string' &&
      typeof r.partKey === 'string' &&
      typeof r.partSku === 'string' &&
      typeof r.title === 'string'
    ) {
      normalized.push({
        id: r.id,
        partKey: r.partKey,
        partSku: r.partSku,
        title: r.title,
      });
    }
  }
  return normalized;
}

/** Persist only staged parts; drawer open state is session-only (memory). */
function readItems(): CatalogStagedPart[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return normalizeItems(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function persistItems(items: CatalogStagedPart[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    /* ignore */
  }
}

let itemsCache: CatalogStagedPart[] = readItems();
let drawerOpenCache = false;
/** Referentially stable until the store mutates — required by `useSyncExternalStore`. */
let cachedSnapshot: SelectionStore = { items: itemsCache, drawerOpen: drawerOpenCache };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): SelectionStore {
  return cachedSnapshot;
}

function setStore(updater: (prev: SelectionStore) => SelectionStore) {
  const prev = cachedSnapshot;
  const next = updater(prev);
  const itemsChanged = next.items !== prev.items;
  const drawerChanged = next.drawerOpen !== prev.drawerOpen;
  if (!itemsChanged && !drawerChanged) return;
  itemsCache = next.items;
  drawerOpenCache = next.drawerOpen;
  cachedSnapshot = { items: itemsCache, drawerOpen: drawerOpenCache };
  if (itemsChanged) {
    persistItems(itemsCache);
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Must match {@link getSnapshot} on the client: React 18 StrictMode compares the two and throws if
 * they differ while sessionStorage already has persisted items (blank screen).
 * This bundle is client-only (no SSR) — see React `useSyncExternalStore` docs for `getServerSnapshot`.
 */
function getServerSnapshot(): SelectionStore {
  return getSnapshot();
}

export type AddStagedInput = {
  partKey: string;
  partSku: string;
  title: string;
};

type CatalogSelectionContextValue = {
  stagedItems: CatalogStagedPart[];
  stagedCount: number;
  drawerOpen: boolean;
  addStaged: (input: AddStagedInput) => 'added' | 'duplicate';
  removeStaged: (id: string) => void;
  clearStaging: () => void;
  setDrawerOpen: (open: boolean) => void;
  openSelectionDrawer: () => void;
};

const CatalogSelectionContext = createContext<CatalogSelectionContextValue | null>(null);

export function CatalogSelectionProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const stagedItems = store.items;
  const stagedCount = stagedItems.length;
  const drawerOpen = store.drawerOpen;

  const addStaged = useCallback((input: AddStagedInput): 'added' | 'duplicate' => {
    let result: 'added' | 'duplicate' = 'duplicate';
    setStore((prev) => {
      if (prev.items.some((i) => i.partKey === input.partKey)) {
        result = 'duplicate';
        return prev;
      }
      const id = `${input.partKey}-${Date.now()}`;
      result = 'added';
      return {
        ...prev,
        items: [...prev.items, { id, partKey: input.partKey, partSku: input.partSku, title: input.title }],
      };
    });
    return result;
  }, []);

  const removeStaged = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }, []);

  const clearStaging = useCallback(() => {
    setStore((prev) => ({ ...prev, items: [] }));
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setStore((prev) => (prev.drawerOpen === open ? prev : { ...prev, drawerOpen: open }));
  }, []);

  const openSelectionDrawer = useCallback(() => {
    setStore((prev) => ({ ...prev, drawerOpen: true }));
  }, []);

  const value = useMemo(
    () => ({
      stagedItems,
      stagedCount,
      drawerOpen,
      addStaged,
      removeStaged,
      clearStaging,
      setDrawerOpen,
      openSelectionDrawer,
    }),
    [
      stagedItems,
      stagedCount,
      drawerOpen,
      addStaged,
      removeStaged,
      clearStaging,
      setDrawerOpen,
      openSelectionDrawer,
    ],
  );

  return (
    <CatalogSelectionContext.Provider value={value}>{children}</CatalogSelectionContext.Provider>
  );
}

export function useCatalogSelection() {
  const ctx = useContext(CatalogSelectionContext);
  if (!ctx) {
    throw new Error('useCatalogSelection must be used within CatalogSelectionProvider');
  }
  return ctx;
}
