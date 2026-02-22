// frontend/src/utils/animations.js

export const flyToCartAnimation = (event, imageSrc) => {
  const cartIcon = document.getElementById("global-cart-icon");
  if (!cartIcon) return;

  // 1. Get the starting position (the button that was clicked)
  const btnRect = event.currentTarget.getBoundingClientRect();

  // 2. Get the target position (the cart icon)
  const cartRect = cartIcon.getBoundingClientRect();

  // 3. Create a flying image element
  const flyingImg = document.createElement("img");
  flyingImg.src = imageSrc;
  flyingImg.className =
    "fixed z-[9999] rounded-xl object-cover shadow-2xl pointer-events-none";

  // 4. Set initial size and position (start at the button)
  const size = 60; // Size of the flying image
  flyingImg.style.width = `${size}px`;
  flyingImg.style.height = `${size}px`;
  flyingImg.style.top = `${btnRect.top - size / 2}px`;
  flyingImg.style.left = `${btnRect.left + btnRect.width / 2 - size / 2}px`;

  // Use a bouncy bezier curve for a premium feel
  flyingImg.style.transition =
    "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  document.body.appendChild(flyingImg);

  // 5. Force a browser reflow so the transition works
  flyingImg.getBoundingClientRect();

  // 6. Calculate the center of the cart icon
  const targetTop = cartRect.top + cartRect.height / 2;
  const targetLeft = cartRect.left + cartRect.width / 2;

  // 7. Apply the end state (fly to cart, shrink, and fade out)
  flyingImg.style.top = `${targetTop}px`;
  flyingImg.style.left = `${targetLeft}px`;
  flyingImg.style.transform = "translate(-50%, -50%) scale(0.1)";
  flyingImg.style.opacity = "0";

  // 8. Cleanup and animate the cart icon bumping
  setTimeout(() => {
    flyingImg.remove();

    // Add a 'bump' effect to the cart icon
    cartIcon.classList.add("scale-125", "text-green-600");
    setTimeout(() => {
      cartIcon.classList.remove("scale-125", "text-green-600");
    }, 200);
  }, 800); // Matches the 0.8s transition time
};
