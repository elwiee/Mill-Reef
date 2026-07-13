document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");
const progressBar = document.querySelector(".scroll-progress span");

const closeMenu = () => {
  if (!header || !menuToggle) return;
  header.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

let scrollFrame = 0;
const updateScrollUi = () => {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 28);
  if (progressBar) progressBar.style.width = `${progress * 100}%`;
  scrollFrame = 0;
};

window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUi);
  },
  { passive: true }
);
updateScrollUi();

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = button.dataset.lightbox || "";
    lightboxImage.alt = button.dataset.alt || "Фотография работы Mill Reef";
    lightboxCaption.textContent = button.dataset.alt || "";
    document.body.classList.add("lightbox-open");
    lightbox.showModal();
  });
});

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.close();
  document.body.classList.remove("lightbox-open");
};

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  if (lightboxImage) lightboxImage.src = "";
});

const phoneInput = document.querySelector('input[name="phone"]');
phoneInput?.addEventListener("input", () => {
  const digits = phoneInput.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return;

  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  const parts = [
    normalized.slice(1, 4),
    normalized.slice(4, 7),
    normalized.slice(7, 9),
    normalized.slice(9, 11)
  ];

  let formatted = "+7";
  if (parts[0]) formatted += ` (${parts[0]}`;
  if (parts[0].length === 3) formatted += ")";
  if (parts[1]) formatted += ` ${parts[1]}`;
  if (parts[2]) formatted += `-${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;
  phoneInput.value = formatted;
});

const estimateForm = document.querySelector("[data-estimate-form]");
const formStatus = document.querySelector("[data-form-status]");

estimateForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const requiredFields = [...estimateForm.querySelectorAll("[required]")];
  let firstInvalid = null;

  requiredFields.forEach((field) => {
    const isCheckbox = field instanceof HTMLInputElement && field.type === "checkbox";
    const isInvalid = isCheckbox ? !field.checked : !field.value.trim();
    field.classList.toggle("field-invalid", isInvalid);
    if (isInvalid && !firstInvalid) firstInvalid = field;
  });

  const phoneDigits = phoneInput?.value.replace(/\D/g, "") || "";
  if (phoneInput && phoneDigits.length < 11) {
    phoneInput.classList.add("field-invalid");
    firstInvalid ||= phoneInput;
  }

  if (firstInvalid) {
    if (formStatus) formStatus.textContent = "Пожалуйста, заполните обязательные поля.";
    firstInvalid.focus();
    return;
  }

  if (formStatus) formStatus.textContent = "Открываем WhatsApp с готовым сообщением…";
  const data = new FormData(estimateForm);
  const message = [
    "Здравствуйте! Хочу предварительно оценить ремонт.",
    `Имя: ${data.get("name")}`,
    `Телефон: ${data.get("phone")}`,
    data.get("car") ? `Автомобиль: ${data.get("car")}` : "",
    `Описание: ${data.get("message")}`,
    "Фотографии приложу следующим сообщением."
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl = `https://wa.me/79291038899?text=${encodeURIComponent(message)}`;
  const openedWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  if (!openedWindow) window.location.href = whatsappUrl;
});

estimateForm?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.classList.remove("field-invalid");
    if (formStatus) formStatus.textContent = "";
  });
  field.addEventListener("change", () => {
    field.classList.remove("field-invalid");
    if (formStatus) formStatus.textContent = "";
  });
});

const yearSlot = document.querySelector("[data-current-year]");
if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());
