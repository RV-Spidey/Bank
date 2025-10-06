// Subtle hover animation helper and active nav state
(function(){
  const links = document.querySelectorAll('.nav a, .btn, .menu a');
  links.forEach((el) => {
    el.addEventListener('mouseenter', () => el.style.transform = 'translateY(-1px)');
    el.addEventListener('mouseleave', () => el.style.transform = 'translateY(0)');
  });

  // Highlight current nav item based on path
  const path = location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '');
    if (href && href === path) {
      a.style.outline = '2px solid #c9a227';
      a.style.outlineOffset = '0px';
    }
  });
})();


