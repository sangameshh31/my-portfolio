/* =========================================================
   SANGAMESH PORTFOLIO JAVASCRIPT
   - Mobile navigation
   - Dark/light mode
   - Scroll reveal
   - Active navigation
   - Animated project counter
   - GitHub repository loading + filtering
   - Contact mailto form
   ========================================================= */

"use strict";

/* ---------- Configuration ---------- */
const GITHUB_USERNAME = "sangameshh31";
const PROJECT_LIMIT = 6;
const FEATURED_REPOSITORIES = ["PIZZAPOS", "movie-recommendation-system", "my-portfolio"];
// Repositories to explicitly hide from the projects list (e.g. username repo)
const EXCLUDED_REPOSITORIES = ["sangameshh31"];
const CONTACT_EMAIL = "sangameshhavalappanavar@gmail.com"; 

// Map repository names to a live demo URL when the repo doesn't specify a homepage
const PROJECT_HOMEPAGES = {
  "my-portfolio": "https://sangamesh-portfolio-tau.vercel.app/"
};

function openEmailComposer(subject = "", body = "") {
  const gmailUrl = new URL("https://mail.google.com/mail/");
  gmailUrl.searchParams.set("view", "cm");
  gmailUrl.searchParams.set("fs", "1");
  gmailUrl.searchParams.set("to", CONTACT_EMAIL);

  if (subject) {
    gmailUrl.searchParams.set("su", subject);
  }

  if (body) {
    gmailUrl.searchParams.set("body", body);
  }

  window.open(gmailUrl.toString(), "_blank", "noopener,noreferrer");
}

/* ---------- DOM references ---------- */
const root = document.documentElement;
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const projectFilters = document.getElementById("projectFilters");
const projectsGrid = document.getElementById("projectsGrid");
const projectStatus = document.getElementById("projectStatus");
const projectCount = document.getElementById("projectCount");
const backToTop = document.getElementById("backToTop");
const year = document.getElementById("year");
const contactForm = document.getElementById("contactForm");

/* ---------- Footer year ---------- */
year.textContent = new Date().getFullYear();

/* ---------- Mobile navigation ---------- */
navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Theme ---------- */
function setTheme(theme) {
  root.classList.toggle("light", theme === "light");
  themeIcon.textContent = theme === "light" ? "☀" : "☾";
  themeToggle.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode"
  );
  localStorage.setItem("portfolio-theme", theme);
}

const savedTheme = localStorage.getItem("portfolio-theme");
const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
setTheme(savedTheme || (systemPrefersLight ? "light" : "dark"));

themeToggle.addEventListener("click", () => {
  setTheme(root.classList.contains("light") ? "dark" : "light");
});

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* ---------- Active navigation link ---------- */
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-link")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

/* ---------- Back to top ---------- */
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 600);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- GitHub Projects ---------- */
let repositories = [];
let activeFilter = "all";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function getTechnologies(repo) {
  const technologies = new Set();

  if (repo.language) technologies.add(repo.language);

  // GitHub repository topics are useful for adding technologies such as
  // react, machine-learning, django, postgresql, etc.
  if (Array.isArray(repo.topics)) {
    repo.topics.forEach((topic) => technologies.add(topic));
  }

  return [...technologies].slice(0, 6);
}

function thumbnailFor(repo) {
  // GitHub generates an Open Graph preview for public repositories.
  return `https://opengraph.githubassets.com/1/${repo.full_name}`;
}

function renderProjects(list) {
  if (!list.length) {
    projectsGrid.innerHTML = `
      <div class="fallback-message">
        No public repositories matched this filter.
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = list.map((repo) => {
    const technologies = getTechnologies(repo);

    const tags = technologies.length
      ? technologies.map((tech) =>
          `<span class="project-tag">${escapeHTML(tech)}</span>`
        ).join("")
      : `<span class="project-tag">GitHub</span>`;

    const description = repo.description || "A project built and maintained on GitHub.";

    // Prefer explicit repo homepage, otherwise consult the manual mapping
    const homepage = repo.homepage || PROJECT_HOMEPAGES[repo.name] || "";

    return `
      <article class="project-card reveal visible">
        <img
          class="project-thumb"
          src="${thumbnailFor(repo)}"
          alt="Preview image for ${escapeHTML(repo.name)}"
          loading="lazy"
          onerror="this.style.display='none'"
        >

        <div class="project-body">
          <h3 class="project-title">${escapeHTML(repo.name)}</h3>

          <p class="project-description">
            ${escapeHTML(description)}
          </p>

          <div class="project-tags" aria-label="Technologies">
            ${tags}
          </div>

          <div class="project-actions">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            ${
              homepage
                ? `<a href="${homepage}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function buildFilters() {
  const technologySet = new Set();

  repositories.forEach((repo) => {
    getTechnologies(repo).forEach((technology) => technologySet.add(technology));
  });

  // Keep the filter bar useful instead of showing dozens of topics.
  const technologies = [...technologySet].sort().slice(0, 10);

  projectFilters.innerHTML = `
    <button class="filter-btn active" type="button" data-filter="all">All</button>
    ${technologies.map((technology) => `
      <button class="filter-btn" type="button" data-filter="${escapeHTML(technology)}">
        ${escapeHTML(technology)}
      </button>
    `).join("")}
  `;

  projectFilters.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      projectFilters.querySelectorAll(".filter-btn").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      const filtered = activeFilter === "all"
        ? repositories
        : repositories.filter((repo) =>
            getTechnologies(repo).some(
              (technology) => technology.toLowerCase() === activeFilter.toLowerCase()
            )
          );

      renderProjects(filtered);
    });
  });
}

async function loadGitHubProjects() {
  projectsGrid.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();

    const featuredRepos = repos.filter((repo) =>
      FEATURED_REPOSITORIES.includes(repo.name) && !repo.fork && !EXCLUDED_REPOSITORIES.includes(repo.name)
    );

    const regularRepos = repos
      .filter((repo) => !repo.fork && !FEATURED_REPOSITORIES.includes(repo.name) && !EXCLUDED_REPOSITORIES.includes(repo.name))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const orderedFeaturedRepos = FEATURED_REPOSITORIES
      .map((repoName) => featuredRepos.find((repo) => repo.name === repoName))
      .filter(Boolean);

    repositories = [
      ...orderedFeaturedRepos,
      ...regularRepos
    ].slice(0, PROJECT_LIMIT);

    projectCount.textContent = repositories.length;

    buildFilters();
    renderProjects(repositories);

    projectStatus.textContent =
      `${repositories.length} project${repositories.length === 1 ? "" : "s"} loaded from GitHub.`;
  } catch (error) {
    console.error("Could not load GitHub projects:", error);

    projectCount.textContent = "—";
    projectStatus.textContent =
      "GitHub projects could not be loaded right now. You can still view all repositories on GitHub.";

    projectsGrid.innerHTML = `
      <div class="fallback-message">
        <strong>Unable to load projects automatically.</strong>
        <p style="margin-top:8px">
          <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories"
             target="_blank" rel="noopener noreferrer">
             Open my GitHub repositories ↗
          </a>
        </p>
      </div>
    `;
  }
}

loadGitHubProjects();

/* ---------- Contact form ---------- */
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = `Portfolio contact from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  openEmailComposer(subject, body);
});
