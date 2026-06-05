import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { itemService } from "@/lib/services/itemService";
import { spaceService } from "@/lib/services/spaceService";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDataStore } from "@/lib/stores/useDataStore";
import type { SaveItem, Space } from "@/lib/types";

export function useSaveItems(category: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Local Zustand store actions & state for offline fallback
  const loadData = useDataStore((s) => s.loadData);
  const localItems = useDataStore((s) => s.items);
  const addLocalItem = useDataStore((s) => s.addItem);
  const updateLocalItem = useDataStore((s) => s.updateItem);
  const deleteLocalItem = useDataStore((s) => s.deleteItem);

  // Fetch list of user spaces when authenticated
  const { data: spaces = [], isLoading: isSpacesLoading } = useQuery<Space[]>({
    queryKey: ["spaces"],
    queryFn: spaceService.fetchMySpaces,
    enabled: isAuthenticated,
    retry: 1,
  });

  // Determine active space (prefer shared space, fallback to personal space)
  const activeSpace = useMemo(() => {
    if (!isAuthenticated || spaces.length === 0) return null;
    const shared = spaces.find((s) => s.type === "shared");
    if (shared) return shared;
    return spaces.find((s) => s.type === "personal") || null;
  }, [spaces, isAuthenticated]);

  const queryClient = useQueryClient();

  // Query server items if activeSpace is resolved
  const { data: serverItems = [], isLoading: isItemsLoading } = useQuery<
    SaveItem[]
  >({
    queryKey: ["items", activeSpace?.id],
    queryFn: () => itemService.fetchItems(activeSpace?.id || ""),
    enabled: !!activeSpace,
  });

  // Server API CRUD mutations
  const addItemMutation = useMutation({
    mutationFn: (item: Omit<SaveItem, "id" | "createdAt">) =>
      itemService.addItem(activeSpace?.id || "", item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace?.id] });
      queryClient.invalidateQueries({
        queryKey: ["spaceStats", activeSpace?.id],
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, ...item }: Partial<SaveItem> & { id: string }) =>
      itemService.updateItem(activeSpace?.id || "", id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace?.id] });
      queryClient.invalidateQueries({
        queryKey: ["spaceStats", activeSpace?.id],
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      itemService.deleteItem(activeSpace?.id || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace?.id] });
      queryClient.invalidateQueries({
        queryKey: ["spaceStats", activeSpace?.id],
      });
    },
  });

  // Unified items list
  const currentItems = isAuthenticated ? serverItems : localItems;

  // Items filtered by category
  const categoryItems = useMemo(
    () => currentItems.filter((i) => i.category === category),
    [currentItems, category],
  );

  // Unified action methods
  const addItem = async (
    item: Omit<SaveItem, "id" | "createdAt" | "category">,
  ) => {
    const payload = { ...item, category };
    if (isAuthenticated && activeSpace) {
      await addItemMutation.mutateAsync(payload);
    } else {
      addLocalItem(payload);
    }
  };

  const updateItem = async (id: string, item: Partial<SaveItem>) => {
    if (isAuthenticated && activeSpace) {
      await updateItemMutation.mutateAsync({ id, ...item });
    } else {
      updateLocalItem({ id, ...item });
    }
  };

  const deleteItem = async (id: string) => {
    if (isAuthenticated && activeSpace) {
      await deleteItemMutation.mutateAsync(id);
    } else {
      deleteLocalItem(id);
    }
  };

  const isLoading = isAuthenticated ? isSpacesLoading || isItemsLoading : false;

  return {
    allItems: currentItems,
    categoryItems,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    loadData,
  };
}
