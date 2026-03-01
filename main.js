document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("mount");
  if (!mount) return;

  const state = {
    selected: {
      category: null,
      subcategory: null,
      issue: null
    },
    view: "home"
  };

  function resetBelow(key) {
    const order = ["category", "subcategory", "issue"];
    const idx = order.indexOf(key);
    for (let i = idx + 1; i < order.length; i++) {
      state.selected[order[i]] = null;
    }
  }

  function setSelected(key, value) {
    if (!key) return;

    if (key === "category") {
      state.selected.category = value;
      state.selected.subcategory = null;
      state.selected.issue = null;
      return;
    }

    if (!state.selected.category) {
      render("home");
      return;
    }

    state.selected[key] = value;
    resetBelow(key);
  }

  function render(view) {
    const template = document.getElementById(`tpl-${view}`);
    if (!template) {
      console.error(`Missing template: tpl-${view}`);
      return;
    }

    mount.replaceChildren(template.content.cloneNode(true));

    state.view = view;
  }

  mount.addEventListener("click", (e) => {
    const el = e.target.closest("[data-next]");
    if (!el) return;

    const next = el.dataset.next;
    const key = el.dataset.set;
    const value = el.dataset.value;

    if (key === "category") {
      setSelected("category", value);
    } else if (key) {
      setSelected(key, value);
    }

    render(next);
    console.log(state);
  });

  render("home");

  window.__KITR_STATE__ = state;

  const FooterSpan = document.getElementById("footer-span");
  FooterSpan.innerText = `${new Date().getFullYear()}`;

  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      console.log("all hail the greezy hamburger."); // placeholder
    });
  }
});