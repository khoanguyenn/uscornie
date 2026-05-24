import { mount } from "@vue/test-utils";
import { vi } from "vitest";
import { createPinia } from "pinia";
import App from "./App.vue";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({ path: "/" })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

describe("App", () => {
  it("renders the router outlet shell", () => {
    const pinia = createPinia();
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.classes()).toContain("app-layout");
  });
});
