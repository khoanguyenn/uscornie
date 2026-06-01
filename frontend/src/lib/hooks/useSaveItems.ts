import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { TAGS_BY_CATEGORY } from "@/lib/data/mock";
import { useAuthStore } from "@/lib/providers/auth-store-provider";
import { useDataStore } from "@/lib/providers/data-store-provider";
import { itemService } from "@/lib/services/itemService";
import { spaceService } from "@/lib/services/spaceService";
import type { SaveItem, Space } from "@/lib/types";
import { createBulkImportSchema } from "@/lib/validation/items";

export function useSaveItems(category: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Local Zustand store actions & state for offline fallback
  const loadData = useDataStore((s) => s.loadData);
  const localItems = useDataStore((s) => s.items);
  const addLocalItem = useDataStore((s) => s.addItem);
  const addLocalItems = useDataStore((s) => s.addItems);
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
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, ...item }: Partial<SaveItem> & { id: string }) =>
      itemService.updateItem(activeSpace?.id || "", id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace?.id] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      itemService.deleteItem(activeSpace?.id || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace?.id] });
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

  const presetTags = useMemo(
    () => TAGS_BY_CATEGORY[category as keyof typeof TAGS_BY_CATEGORY] || [],
    [category],
  );

  const bulkImport = async (
    newItems: Omit<SaveItem, "id" | "createdAt" | "category">[],
  ) => {
    // Validate locally using Zod and allowed category-specific tags
    const schema = createBulkImportSchema(presetTags);
    const validationResult = schema.safeParse(newItems);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => {
          const index = e.path[0];
          if (typeof index === "number") {
            return `• Mục số ${index + 1}: ${e.message}`;
          }
          return `• ${e.path.join(".")}: ${e.message}`;
        })
        .join("\n");
      throw new Error(`Dữ liệu không hợp lệ:\n${errorMsg}`);
    }

    const itemsWithCat = newItems.map((item) => ({ ...item, category }));
    if (isAuthenticated && activeSpace) {
      await itemService.addItemsBulk(
        activeSpace.id,
        itemsWithCat.map((item) => ({
          category: item.category,
          title: item.title,
          desc: item.desc || "",
          tag: item.tag || "",
          image: item.image || null,
        })),
      );
      queryClient.invalidateQueries({ queryKey: ["items", activeSpace.id] });
    } else {
      addLocalItems(itemsWithCat);
    }
  };

  const isLoading = isAuthenticated ? isSpacesLoading || isItemsLoading : false;

  return {
    allItems: currentItems,
    categoryItems,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    isLoading,
    loadData,
  };
}
