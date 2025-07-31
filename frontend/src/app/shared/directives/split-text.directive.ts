import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSplitText]',
  standalone: false
})
export class SplitTextDirective implements OnInit, OnDestroy {
  @Input() animationDelay: number = 100; // delay between each character in ms
  @Input() animationDuration: number = 600; // duration for each character animation in ms
  @Input() triggerOnScroll: boolean = true;
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '-50px';

  private observer?: IntersectionObserver;
  private hasAnimated = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupText();
    
    if (this.triggerOnScroll) {
      this.setupIntersectionObserver();
    } else {
      // If not triggering on scroll, animate immediately
      setTimeout(() => this.triggerAnimation(), 100);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupText() {
    const text = this.el.nativeElement.textContent || '';
    if (!text) {
      console.warn('No text content found for split text animation');
      return;
    }
    
    const characters = text.split('');
    
    // Clear the original text
    this.el.nativeElement.innerHTML = '';
    
    // Add split-text class to the container
    this.renderer.addClass(this.el.nativeElement, 'split-text-container');
    
    // Create a span for each character
    characters.forEach((char: string, index: number) => {
      const span = this.renderer.createElement('span');
      this.renderer.addClass(span, 'split-char');
      span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space
      
      // Set animation delay for staggered effect
      const delay = index * this.animationDelay;
      this.renderer.setStyle(span, 'animation-delay', `${delay}ms`);
      this.renderer.setStyle(span, 'animation-duration', `${this.animationDuration}ms`);
      
      this.el.nativeElement.appendChild(span);
    });
  }

  private setupIntersectionObserver() {
    const options = {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.triggerAnimation();
          this.hasAnimated = true;
          this.observer?.disconnect();
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private triggerAnimation() {
    // Add the animation trigger class
    this.renderer.addClass(this.el.nativeElement, 'animate-split-text');
  }
}