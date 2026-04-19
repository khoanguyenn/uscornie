import { mount } from "@vue/test-utils";

import App from "./App.vue";

describe("App", () => {
  it("renders the router outlet shell", () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
        },
      },
    });

    expect(wrapper.classes()).toContain("min-h-screen");
  });
});
