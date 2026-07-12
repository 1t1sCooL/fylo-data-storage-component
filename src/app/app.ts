import {
  AfterViewInit,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Total storage available, in GB. */
  protected readonly totalGb = signal(1000);
  /** Storage already used, in GB. */
  protected readonly usedGb = signal(815);

  /** Storage left, in GB. */
  protected readonly leftGb = computed(() => this.totalGb() - this.usedGb());

  /** Flips to true after first render so the meter can transition from 0. */
  protected readonly filled = signal(false);

  /** Number shown in the badge — counts up to `leftGb`. */
  protected readonly displayLeft = signal(0);

  /** Meter width: 0 until the reveal animation kicks in, then the real share. */
  protected readonly barWidth = computed(() =>
    this.filled() ? `${(this.usedGb() / this.totalGb()) * 100}%` : '0%',
  );

  protected readonly links = [
    { icon: 'images/icon-document.svg', label: 'Documents' },
    { icon: 'images/icon-folder.svg', label: 'Folders' },
    { icon: 'images/icon-upload.svg', label: 'Uploads' },
  ];

  ngAfterViewInit(): void {
    const target = this.leftGb();
    const reduceMotion =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.filled.set(true);
      this.displayLeft.set(target);
      return;
    }

    // Reveal the meter fill (CSS transition does the actual tweening).
    const revealId = setTimeout(() => this.filled.set(true), 150);

    // Count the "GB Left" number up to its target.
    const duration = 1400;
    let start: number | null = null;
    let rafId = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      this.displayLeft.set(Math.round(easeOut(progress) * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    this.destroyRef.onDestroy(() => {
      clearTimeout(revealId);
      cancelAnimationFrame(rafId);
    });
  }
}
