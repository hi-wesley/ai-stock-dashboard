import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  /** Array of candles for a single stock symbol */
  @Input() data: PricePoint[] | null | undefined = [];
  /** The stock ticker (e.g. "NVDA") used for the legend/tooltip label */
  @Input() symbol = '';

  /**
   * ngx‑charts needs:
   * [
   *   {
   *     name: 'NVDA',
   *     series: [
   *       { name: Date, value: closePrice },
   *       …
   *     ]
   *   }
   * ]
   *
   * We guard against the first null/undefined emission so Angular won’t
   * throw “Cannot read properties of null (reading 'map')”.
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
