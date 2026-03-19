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

  function capitalize(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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

    render(next)

    if (next === "contact" && state.selected.category) {
      const contactCategoryMount = document.getElementById("contactCategoryMount");
      const contactIssueMount = document.getElementById("contactIssueMount");
      const phoneInput = document.getElementById("client-telno");
      const categoryEl = document.createElement("p");
      const issueEl = document.createElement("p");

      if (state.selected.category === "device") { 
        categoryEl.textContent = `${capitalize(state.selected.category)}: ${capitalize(state.selected.subcategory)}` 
      } else {
        categoryEl.textContent = `${capitalize(state.selected.category)}`
      };

      issueEl.textContent = `Issue: ${capitalize(state.selected.issue)}`

      contactCategoryMount.append(categoryEl);
      contactIssueMount.append(issueEl);

      phoneInput.addEventListener("input", (e) => {
        let digits = e.target.value.replace(/\D/g, "");
        digits = digits.slice(0, 10);
        let formatted = "";

        if (digits.length > 0) {
          formatted += "(" + digits.slice(0, 3);
        }

        if (digits.length >= 4) {
          formatted += ") " + digits.slice(3, 6);
        }

        if (digits.length >= 7) {
          formatted += "-" + digits.slice(6, 10);
        }

        e.target.value = formatted;
      });
    } 

    console.log(state);
  });

  render("home");

  const FooterSpan = document.getElementById("footer-span");
  FooterSpan.innerText = `${new Date().getFullYear()}`;

  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      console.log("all hail the greezy hamburger."); // placeholder
    });
  };
});