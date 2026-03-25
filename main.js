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
      const submitButton = document.getElementById("submit_button");
      const phoneInput = document.getElementById("client-telno");
      const emailInput = document.getElementById("client-email")
      const categoryEl = document.createElement("p");
      const issueEl = document.createElement("p");
      const radioCall = document.getElementById("radio_call");
      const radioText = document.getElementById("radio_text");
      const radioEmail = document.getElementById("radio_email");
      let contactSelection;

      if (state.selected.category === "device") { 
        categoryEl.textContent = `Device: ${capitalize(state.selected.subcategory)}`;
        issueEl.textContent = `Issue: ${capitalize(state.selected.issue)}`; 
      } else if (state.selected.category === "network") {
        categoryEl.textContent = `You're requesting help with your network.`
        issueEl.textContent = "Let's fix your issue."
      } else {
        categoryEl.textContent = "Let us know more about what you need help with below.";
        issueEl.textContent = "It will help us give you an accurate quote."
      };

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
        enableSubmit();
      });

      emailInput.addEventListener("input", (e) => {
        enableSubmit();
      });

      radioCall.addEventListener("input", (e) => {
        contactSelection = "call";
        enableSubmit();
      });

      radioText.addEventListener("input", (e) => {
        contactSelection = "text";
        enableSubmit();
      });

      radioEmail.addEventListener("input", (e) => {
        contactSelection = "email";
        enableSubmit();
      });

      function enableSubmit() {
        if ((contactSelection === "call" || contactSelection === "text") && phoneInput.value) {
          submitButton.removeAttribute('disabled');
        } else if (contactSelection === "email" && emailInput.value) {
          submitButton.removeAttribute('disabled');
        } else {
          submitButton.disabled = true;
        }
      }

      document.getElementById("funnel-form").addEventListener("submit", function (e) {

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "metadata";
        hiddenInput.value = JSON.stringify(state.selected);

        this.appendChild(hiddenInput);
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