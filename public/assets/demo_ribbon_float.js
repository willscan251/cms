/* Enhanced floating CTA for demo pages - Scanland CMS */
(function(){
  // Prevent multiple instances
  if (window.__scanland_demo_ribbon__) return; 
  window.__scanland_demo_ribbon__ = true;
  
  // Create main container
  const ribbon = document.createElement('div');
  ribbon.setAttribute('role', 'complementary');
  ribbon.setAttribute('aria-label', 'Scanland CMS call-to-action');
  ribbon.id = 'scanland-demo-ribbon';
  
  // Enhanced styling with better responsiveness and animation
  ribbon.style.cssText = `
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--color-bg, #F3E7D1);
    border-top: 3px solid var(--color-accent, #7BB58C);
    box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
    z-index: 999999;
    font-family: inherit;
    font-size: 16px;
    transform: translateY(100%);
    transition: transform 0.3s ease-out;
    backdrop-filter: blur(10px);
  `;
  
  // Create content wrapper for better layout control
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    max-width: 1000px;
    width: 100%;
  `;
  
  // Main text with better messaging
  const text = document.createElement('span');
  text.textContent = '✨ Ready to add this CMS to your site? Plans start at $29/month.';
  text.style.cssText = `
    font-weight: 600;
    color: var(--color-primary, #0F3D27);
    margin-right: 8px;
    line-height: 1.4;
  `;
  
  // Enhanced button creator
  function createButton(label, href, isPrimary = false) {
    const btn = document.createElement('a');
    btn.textContent = label;
    btn.href = href;
    btn.style.cssText = `
      display: inline-block;
      padding: 10px 18px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 2px solid var(--color-primary, #0F3D27);
      ${isPrimary 
        ? `background: var(--color-primary, #0F3D27); color: var(--color-bg, #F3E7D1);`
        : `background: transparent; color: var(--color-primary, #0F3D27);`
      }
    `;
    
    // Hover effects
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 12px rgba(15, 61, 39, 0.2)';
      if (!isPrimary) {
        btn.style.background = 'var(--color-primary, #0F3D27)';
        btn.style.color = 'var(--color-bg, #F3E7D1)';
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
      if (!isPrimary) {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--color-primary, #0F3D27)';
      }
    });
    
    return btn;
  }
  
  // Create buttons with better copy
  const pricingBtn = createButton('See Pricing', '/pricing', false);
  const contactBtn = createButton('Get Started', '/contact', true);
  
  // Enhanced close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Dismiss this notification');
  closeBtn.style.cssText = `
    border: none;
    background: transparent;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: var(--color-primary, #0F3D27);
    margin-left: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  `;
  
  // Close button interactions
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(15, 61, 39, 0.1)';
    closeBtn.style.transform = 'scale(1.1)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'transparent';
    closeBtn.style.transform = 'scale(1)';
  });
  
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    ribbon.style.transform = 'translateY(100%)';
    setTimeout(() => {
      if (ribbon.parentNode) {
        ribbon.remove();
      }
    }, 300);
    
    // Store dismissal in sessionStorage
    try {
      sessionStorage.setItem('scanland_ribbon_dismissed', 'true');
    } catch (e) {
      // Ignore if sessionStorage unavailable
    }
  });
  
  // Assemble the ribbon
  content.appendChild(text);
  content.appendChild(pricingBtn);
  content.appendChild(contactBtn);
  content.appendChild(closeBtn);
  ribbon.appendChild(content);
  
  // Check if previously dismissed this session
  try {
    if (sessionStorage.getItem('scanland_ribbon_dismissed')) {
      return;
    }
  } catch (e) {
    // Continue if sessionStorage unavailable
  }
  
  // Add to page
  document.body.appendChild(ribbon);
  
  // Animate in after a brief delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      ribbon.style.transform = 'translateY(0)';
    }, 500);
  });
  
  // Add responsive behavior
  function handleResize() {
    if (window.innerWidth < 768) {
      content.style.flexDirection = 'column';
      content.style.gap = '8px';
      text.style.textAlign = 'center';
      text.style.marginRight = '0';
    } else {
      content.style.flexDirection = 'row';
      content.style.gap = '12px';
      text.style.textAlign = 'left';
      text.style.marginRight = '8px';
    }
  }
  
  handleResize();
  window.addEventListener('resize', handleResize);
  
  // Auto-hide after 30 seconds (optional)
  setTimeout(() => {
    if (ribbon.parentNode) {
      ribbon.style.opacity = '0.7';
    }
  }, 30000);
  
})();