
document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".hero-logo");
    const stage = logo?.querySelector(".hero-logo__stage");
    const hoverArea = logo?.querySelector(".hero-logo__hover-area");

    if (!logo || !stage || !hoverArea) return;

    const layers = [
        ...stage.querySelectorAll(".hero-logo__layer[data-depth]")
    ];

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const maxMovement = 30;
    const returnDuration = 700;
    const returnEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

    let frame = null;
    let pointerX = 0;
    let pointerY = 0;

    function render() {
        frame = null;

        layers.forEach((layer) => {
            const depth = Number(layer.dataset.depth || 0);

            const x = pointerX * maxMovement * depth;
            const y = pointerY * maxMovement * depth;

            layer.style.translate = `${x}px ${y}px`;
        });
    }

    function scheduleRender() {
        if (frame === null) {
            frame = requestAnimationFrame(render);
        }
    }

    function onPointerMove(event) {
        if (reduceMotion.matches) return;

        const rect = hoverArea.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        layers.forEach((layer) => {
            layer.style.transition = "none";
        });

        scheduleRender();
    }

    function reset() {
        if (reduceMotion.matches) {
            clearMovement();
            return;
        }

        pointerX = 0;
        pointerY = 0;

        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }

        layers.forEach((layer) => {
            layer.style.transition =
                `translate ${returnDuration}ms ${returnEasing}`;

            layer.style.translate = "0px 0px";
        });
    }

    function clearMovement() {
        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }

        layers.forEach((layer) => {
            layer.style.transition = "none";
            layer.style.translate = "0px 0px";
        });
    }

    hoverArea.addEventListener("pointermove", onPointerMove);
    hoverArea.addEventListener("pointerleave", reset);

    if (reduceMotion.matches) {
        clearMovement();
    }

    reduceMotion.addEventListener("change", (event) => {
        if (event.matches) {
            clearMovement();
        }
    });
});
