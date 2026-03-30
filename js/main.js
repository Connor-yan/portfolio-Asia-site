document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".horizontal-track");
    const navLinks = document.querySelectorAll(".nav a");
    const quickLinks = document.querySelectorAll("[data-index]");
    const panelInners = document.querySelectorAll(".panel .panel-inner");
    const sideProgressItems = document.querySelectorAll(".side-progress-item");

    let currentPanel = 0;
    let isAnimating = false;
    const totalPanels = 4;

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    function updateNavActive(index) {
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (Number(link.dataset.index) === index) {
                link.classList.add("active");
            }
        });

        sideProgressItems.forEach((item) => {
            item.classList.remove("active");
            if (Number(item.dataset.index) === index) {
                item.classList.add("active");
            }
        });
    }

    function getPanelNameByIndex(index) {
        const map = ["home", "showreel", "projects", "about"];
        return map[index] || "home";
    }

    function getPanelIndexFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const panel = params.get("panel");

        if (panel === "home") return 0;
        if (panel === "showreel") return 1;
        if (panel === "projects") return 2;
        if (panel === "about") return 3;

        return 0;
    }

    function updateSlider(index, updateUrl = true) {
        if (!track) return;

        if (index < 0) index = 0;
        if (index > totalPanels - 1) index = totalPanels - 1;

        currentPanel = index;
        isAnimating = true;

        track.style.transform = `translateX(-${index * 100}vw)`;

        panelInners.forEach((panel) => panel.classList.remove("panel-visible"));

        if (panelInners[index]) {
            setTimeout(() => {
                panelInners[index].classList.add("panel-visible");
            }, 120);
        }

        updateNavActive(index);

        if (updateUrl) {
            const panelName = getPanelNameByIndex(index);
            const basePath = window.location.pathname.split("/").pop() || "index.html";
            history.replaceState(null, "", `${basePath}?panel=${panelName}`);
        }

        setTimeout(() => {
            isAnimating = false;
        }, 950);
    }

    function goToPanelByQuery() {
        if (!track) return;

        const targetIndex = getPanelIndexFromQuery();

        requestAnimationFrame(() => {
            updateSlider(targetIndex, false);
        });
    }

    window.addEventListener(
        "wheel",
        function (e) {
            if (!track) return;

            if (isAnimating) {
                e.preventDefault();
                return;
            }

            if (e.deltaY > 30) {
                e.preventDefault();
                updateSlider(currentPanel + 1);
            } else if (e.deltaY < -30) {
                e.preventDefault();
                updateSlider(currentPanel - 1);
            }
        },
        { passive: false }
    );

    quickLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            const targetIndex = this.dataset.index;

            if (targetIndex !== undefined && track) {
                e.preventDefault();
                updateSlider(Number(targetIndex));
            }
        });
    });

    window.addEventListener("keydown", function (e) {
        if (!track || isAnimating) return;

        if (e.key === "ArrowRight") {
            updateSlider(currentPanel + 1);
        } else if (e.key === "ArrowLeft") {
            updateSlider(currentPanel - 1);
        }
    });

    const projectCards = document.querySelectorAll(".rotator-card");
    const nextProjectBtn = document.getElementById("nextProjectBtn");
    const prevProjectBtn = document.getElementById("prevProjectBtn");
    const indicatorItems = document.querySelectorAll(".indicator-item");

    let projectOrder = [0, 1, 2];
    let isProjectAnimating = false;
    let hoverCooldown = false;

    function renderProjectCards() {
        if (!projectCards.length) return;

        projectCards.forEach((card, index) => {
            card.classList.remove("card-pos-0", "card-pos-1", "card-pos-2");
            card.removeAttribute("data-role");

            const visualPosition = projectOrder.indexOf(index);
            card.classList.add(`card-pos-${visualPosition}`);

            if (visualPosition === 0) {
                card.setAttribute("data-role", "left");
            } else if (visualPosition === 1) {
                card.setAttribute("data-role", "center");
            } else if (visualPosition === 2) {
                card.setAttribute("data-role", "right");
            }
        });

        if (indicatorItems.length) {
            indicatorItems.forEach((item) => item.classList.remove("active"));

            const centerCardIndex = projectOrder[1];
            if (indicatorItems[centerCardIndex]) {
                indicatorItems[centerCardIndex].classList.add("active");
            }
        }
    }

    function rotateProjectsNext() {
        if (isProjectAnimating || !projectCards.length) return;

        isProjectAnimating = true;

        const currentFrontIndex = projectOrder[1];
        if (projectCards[currentFrontIndex]) {
            projectCards[currentFrontIndex].classList.add("is-flipping");
        }

        setTimeout(() => {
            const first = projectOrder.shift();
            projectOrder.push(first);

            renderProjectCards();

            projectCards.forEach((card) => card.classList.remove("is-flipping"));
            isProjectAnimating = false;
        }, 850);
    }

    function rotateProjectsPrev() {
        if (isProjectAnimating || !projectCards.length) return;

        isProjectAnimating = true;

        const currentFrontIndex = projectOrder[1];
        if (projectCards[currentFrontIndex]) {
            projectCards[currentFrontIndex].classList.add("is-flipping");
        }

        setTimeout(() => {
            const last = projectOrder.pop();
            projectOrder.unshift(last);

            renderProjectCards();

            projectCards.forEach((card) => card.classList.remove("is-flipping"));
            isProjectAnimating = false;
        }, 850);
    }

    if (nextProjectBtn) {
        nextProjectBtn.addEventListener("click", function (e) {
            e.preventDefault();
            rotateProjectsNext();
        });
    }

    if (prevProjectBtn) {
        prevProjectBtn.addEventListener("click", function (e) {
            e.preventDefault();
            rotateProjectsPrev();
        });
    }

    projectCards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
            if (hoverCooldown || isProjectAnimating) return;

            const role = this.getAttribute("data-role");

            if (role === "left") {
                hoverCooldown = true;
                rotateProjectsPrev();
                setTimeout(() => {
                    hoverCooldown = false;
                }, 1000);
            } else if (role === "right") {
                hoverCooldown = true;
                rotateProjectsNext();
                setTimeout(() => {
                    hoverCooldown = false;
                }, 1000);
            }
        });
    });

    projectCards.forEach((card) => {
        card.addEventListener("click", function (e) {
            const role = this.getAttribute("data-role");

            if (role === "left") {
                e.preventDefault();
                rotateProjectsPrev();
            } else if (role === "right") {
                e.preventDefault();
                rotateProjectsNext();
            }
        });
    });

    renderProjectCards();
    goToPanelByQuery();

    if (!track) {
        document.querySelectorAll(".panel-inner").forEach((panel) => {
            panel.classList.add("panel-visible");
        });
    }
});

document.querySelectorAll(".image-archive-section").forEach((section) => {
    const thumbs = section.querySelectorAll(".media-thumb");
    const captionBox = section.querySelector("#imageArchiveCaption");

    thumbs.forEach((thumb) => {
        thumb.addEventListener("mouseenter", function () {
            thumbs.forEach((item) => item.classList.remove("is-active"));
            this.classList.add("is-active");

            const label = this.dataset.imageLabel || "01";
            const caption = this.dataset.imageCaption || "";

            if (captionBox) {
                captionBox.innerHTML = `
                    <span class="film-caption-index">${label}</span>
                    <p>${caption}</p>
                `;
            }
        });
    });
});