import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-aurora-background',
    templateUrl: './aurora-background.component.html',
    styleUrls: ['./aurora-background.component.scss'],
    standalone: false
})
export class AuroraBackgroundComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private animationId?: number;
  private starColor: string = '#000000';
  
  constructor(@Inject(DOCUMENT) private document: Document) {}
  
  ngOnInit(): void {
    this.initStars();
  }
  
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Get the aurora color and create a stronger version for stars
    const computedStyle = getComputedStyle(this.document.documentElement);
    const auroraRgb = computedStyle.getPropertyValue('--aurora-rgb').trim();
    const [r, g, b] = auroraRgb.split(',').map(v => parseInt(v.trim()));
    
    // Create a stronger version by increasing saturation
    // Convert to HSL to manipulate saturation
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    
    let s = 0;
    let h = 0;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }
    
    // Increase saturation by 50% and decrease lightness by 20% for more vibrant stars
    s = Math.min(1, s * 1.5);
    const newL = l * 0.8;
    
    // Convert back to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    
    const [strongR, strongG, strongB] = hslToRgb(h, s, newL);
    this.starColor = `${strongR}, ${strongG}, ${strongB}`;
    
    this.animate();
  }
  
  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  private initStars(): void {
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random()
      });
    }
  }
  
  private animate(): void {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > window.innerHeight) {
        star.y = 0;
        star.x = Math.random() * window.innerWidth;
      }
      
      star.opacity = Math.sin(Date.now() * 0.001 + star.x) * 0.5 + 0.5;
      
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.starColor}, ${star.opacity * 0.7})`;
      this.ctx.fill();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
}