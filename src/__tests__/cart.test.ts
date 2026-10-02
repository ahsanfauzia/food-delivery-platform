import { useCartStore } from "../store/useCartStore";

describe("Zustand useCartStore Suite", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test run
    useCartStore.getState().clearCart();
  });

  test("should start with an empty cart state", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.restaurantId).toBeNull();
    expect(state.restaurantName).toBeNull();
    expect(state.getTotalItems()).toBe(0);
    expect(state.getSubtotal()).toBe(0);
  });

  test("should allow adding items from the same restaurant", () => {
    const item1 = { id: "item-1", name: "Butter Chicken", price: 250, image: "/images/bc.jpg", isVeg: false };
    
    // Add first item
    const res1 = useCartStore.getState().addItem(item1, "rest-1", "Dhaba Style");
    expect(res1.success).toBe(true);
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().restaurantId).toBe("rest-1");

    // Add same item again (quantity should increment)
    const res2 = useCartStore.getState().addItem(item1, "rest-1", "Dhaba Style");
    expect(res2.success).toBe(true);
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    // Get stats
    expect(useCartStore.getState().getTotalItems()).toBe(2);
    expect(useCartStore.getState().getSubtotal()).toBe(500);
  });

  test("should block adding items from a different restaurant", () => {
    const item1 = { id: "item-1", name: "Butter Chicken", price: 250, image: "/images/bc.jpg", isVeg: false };
    const item2 = { id: "item-2", name: "Veg Burger", price: 150, image: "/images/burger.jpg", isVeg: true };

    // Add first item from Restaurant 1
    useCartStore.getState().addItem(item1, "rest-1", "Dhaba Style");

    // Try adding second item from Restaurant 2
    const res2 = useCartStore.getState().addItem(item2, "rest-2", "Burger King");
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('contains items from "Dhaba Style"');
    
    // Verify cart was not modified
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().restaurantId).toBe("rest-1");
  });

  test("should update item quantity correctly", () => {
    const item = { id: "item-1", name: "Butter Chicken", price: 250, image: "/images/bc.jpg", isVeg: false };
    useCartStore.getState().addItem(item, "rest-1", "Dhaba Style");

    // Update to 5 quantity
    useCartStore.getState().updateQuantity("item-1", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().getSubtotal()).toBe(1250);

    // Update to 0 (should remove item)
    useCartStore.getState().updateQuantity("item-1", 0);
    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().restaurantId).toBeNull();
  });

  test("should remove item and clear store when empty", () => {
    const item = { id: "item-1", name: "Butter Chicken", price: 250, image: "/images/bc.jpg", isVeg: false };
    useCartStore.getState().addItem(item, "rest-1", "Dhaba Style");

    useCartStore.getState().removeItem("item-1");
    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().restaurantId).toBeNull();
  });
});
