document.addEventListener("DOMContentLoaded", function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Detect if device is mobile
    const isMobile = window.innerWidth <= 768;

    // Initialize main content animations first
    const mainTimeline = gsap.timeline({
        defaults: { ease: "power3.out" }
    });

    mainTimeline
        .from(".content", {
            duration: isMobile ? 0.8 : 1,
            y: 30,
            opacity: 0,
            ease: "power4.out",
            clearProps: "all"
        })
        .from(".logo", {
            duration: 0.8,
            scale: 0.6,
            opacity: 0,
            rotation: isMobile ? 0 : -10,
            ease: "back.out(1.7)",
        }, "-=0.4")
        .from(".description", {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power3.out",
        }, "-=0.4")
        .from(".button-container", {
            duration: 0.8,
            scale: 0.8,
            opacity: 0,
            y: 15,
            ease: "back.out(1.7)",
        }, "-=0.4")
        .from(".page-footer", {
            duration: 0.5,
            opacity: 0,
            y: 10,
            ease: "power2.out"
        }, "-=0.6");

    // Show welcome modal with animation
    const showModal = () => {
        const modal = document.getElementById('welcomeModal');
        const overlay = document.getElementById('welcomeOverlay');
        
        if (!modal || !overlay) {
            console.error('Modal elements not found');
            return;
        }

        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = modal.querySelector('.modal-title');
        const modalItems = modal.querySelectorAll('li');
        const modalParagraphs = modalContent.querySelectorAll('p');
        
        // Initial setup
        gsap.set([modal, overlay], { opacity: 0 });
        gsap.set(modal, { 
            scale: 0.8,
            y: isMobile ? 20 : 0
        });
        gsap.set(modalTitle, { opacity: 0, y: -20 });
        gsap.set(modalParagraphs, { opacity: 0, y: 20 });
        gsap.set(modalItems, { opacity: 0, x: -20 });
        
        // Show the elements before animation
        modal.style.visibility = 'visible';
        overlay.style.visibility = 'visible';
        
        // Create animation timeline
        const modalTimeline = gsap.timeline({
            defaults: { ease: "power3.out" }
        });

        modalTimeline
            .to(overlay, {
                opacity: 1,
                duration: isMobile ? 0.3 : 0.4,
                ease: "power2.inOut"
            })
            .to(modal, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: isMobile ? 0.4 : 0.5,
                ease: "back.out(1.7)"
            }, "-=0.2")
            .to(modalTitle, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "back.out(1.5)"
            }, "-=0.2")
            .to(modalParagraphs, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.08,
                ease: "power2.out"
            }, "-=0.2")
            .to(modalItems, {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.06,
                ease: "back.out(1.2)"
            }, "-=0.2");
        
        modal.classList.add('show');
        overlay.classList.add('show');
    };

    // Call showModal after content animations
    setTimeout(showModal, isMobile ? 800 : 1000);

    // Enhanced button interactions
    const btn = document.querySelector('.feedback-btn');
    if (btn) {
        if (!isMobile) {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.03,
                    y: -4,
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                // Enhanced shine effect
                const shine = document.createElement('div');
                shine.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    transform: skewX(-20deg);
                    pointer-events: none;
                `;
                btn.appendChild(shine);
                
                gsap.to(shine, {
                    left: '200%',
                    duration: 1.2,
                    ease: "power2.inOut",
                    onComplete: () => shine.remove()
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
        }
    }

    // Add parallax effect only on desktop
    if (window.innerWidth > 768) {
        let xTo = gsap.quickTo(".content", "rotationY", {duration: 0.8, ease: "power3.out"}),
            yTo = gsap.quickTo(".content", "rotationX", {duration: 0.8, ease: "power3.out"});

        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 60;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
            
            xTo(xAxis);
            yTo(-yAxis);
        });

        document.addEventListener('mouseleave', () => {
            gsap.to(".content", {
                rotationY: 0,
                rotationX: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        });
    }

    // Smooth scroll handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Enhanced modal close function with sophisticated animations
function closeModal() {
    const isMobile = window.innerWidth <= 768;
    const modal = document.getElementById('welcomeModal');
    const overlay = document.getElementById('welcomeOverlay');
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalItems = modal.querySelectorAll('li');
    
    const tl = gsap.timeline({
        onComplete: () => {
            modal.classList.remove('show');
            overlay.classList.remove('show');
            setTimeout(() => {
                modal.style.visibility = 'hidden';
                overlay.style.visibility = 'hidden';
            }, 300);
        }
    });

    tl.to(modalItems, {
        opacity: 0,
        x: -15,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in"
    })
    .to(modalContent.children, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in"
    }, "-=0.1")
    .to(modalTitle, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        ease: "power2.in"
    }, "-=0.1")
    .to(modal, {
        opacity: 0,
        scale: 0.85,
        y: isMobile ? 15 : 0,
        duration: 0.3,
        ease: "power2.in"
    }, "-=0.2")
    .to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
    }, "-=0.3");

    // Show welcome toast with enhanced design
    const toast = document.getElementById('welcomeToast');
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); border-radius: 12px; width: ${isMobile ? '36px' : '42px'}; height: ${isMobile ? '36px' : '42px'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px -6px rgba(61, 146, 95, 0.4);">
                <span style="color: white; font-size: ${isMobile ? '1.2em' : '1.4em'};">👋</span>
            </div>
            <div>
                <div style="font-weight: 600; color: var(--text-primary); font-size: ${isMobile ? '1em' : '1.1em'}; margin-bottom: 2px;">Welcome to BRGHMC!</div>
                <div style="color: var(--text-secondary); font-size: ${isMobile ? '0.85em' : '0.9em'};">We're glad you're here</div>
            </div>
        </div>
    `;

    // Enhanced toast animation
    gsap.fromTo(toast,
        {
            y: 100,
            opacity: 0,
            scale: 0.8
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: isMobile ? 0.5 : 0.6,
            ease: "back.out(1.7)",
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(toast, {
                        y: 100,
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.4,
                        ease: "back.in(1.7)"
                    });
                }, isMobile ? 2500 : 3000);
            }
        }
    );
}
