import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { PricePoint } from '../../core/models/price-point';

/**
 * A thin wrapper around ngx‑charts' <ngx-charts-line-chart>.
 * It turns our raw price array into the [{name, series:[…]}] format the
 * library expects and uses OnPush so Angular only re‑checks the component
 * when @Input values actually change.
 */
@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LineChartComponent implements OnInit, OnDestroy {
  /** Array of candles for a single stock symbol */
  @Input() data: PricePoint[] | null | undefined = [];
  /** The stock ticker (e.g. "GOOGL") used for the legend/tooltip label */
  @Input() symbol = '';
  
  /** Dynamic chart dimensions [width, height] */
  chartView: [number, number] = [700, 350];
  
  /** Debounce timer for resize events */
  private resizeTimer: any;

  ngOnInit(): void {
    this.calculateChartDimensions();
  }
  
  ngOnDestroy(): void {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    
    this.resizeTimer = setTimeout(() => {
      this.calculateChartDimensions();
    }, 250);
  }
  
  private calculateChartDimensions(): void {
    const width = window.innerWidth;
    let chartWidth: number;
    let chartHeight: number;
    
    if (width < 768) {
      chartWidth = Math.min(width - 60, 700);
    } else if (width >= 768 && width < 1024) {
      chartWidth = Math.min(width - 80, 600);
    } else {
      const containerMaxWidth = 1080;
      const containerPadding = 64;
      const maxAvailable = containerMaxWidth - containerPadding;
      chartWidth = Math.min(maxAvailable, 700);
    }
    
    chartWidth = Math.max(chartWidth, 280);
    chartHeight = chartWidth / 2;
    
    this.chartView = [chartWidth, chartHeight];
  }

  /**
   * ngx‑charts needs:
   * [
   *   {
   *     name: 'GOOGL',
   *     series: [
   *       { name: Date, value: closePrice },
   *       …
   *     ]
   *   }
   * ]
   *
   * We guard against the first null/undefined emission so Angular won't
   * throw "Cannot read properties of null (reading 'map')".
   */
  get series() {
    const points = this.data ?? [];
    return [
      {
        name: this.symbol,
        series: points.map(p => ({
          name: new Date(p.date),
          value: p.close
        }))
      }
    ];
  }
}
