import { effect, Input, PLATFORM_ID } from '@angular/core';
import { Component, OnInit, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { IngresosMensualesController } from '../../controllers/ingresos_mensuales_controller';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-line-chart',
    standalone: true,
  imports: [ChartModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css',
})
export class LineChart{
        data = signal<any>(null);
        options = signal<any>(null);
        platformId = inject(PLATFORM_ID);
        private authService = inject(AuthService);

        @Input() ingresos = signal<{ mes: string; ingresos: number }[]>([]);

    constructor() {
        const ingresosMensualesController = new IngresosMensualesController(this.authService);
        void ingresosMensualesController.getIngresosMensuales().then((ingresos) => {
            this.ingresos.set(ingresos);
        });

        effect(() => {
            const ingresos = this.ingresos();
            if (ingresos.length > 0) {
                this.initChart();
                console.log("Ingresos mensuales en el componente LineChart:", ingresos);
            }         
        });
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
        
            this.data.set({
                labels: this.ingresos().map((ingreso) => ingreso.mes),
                datasets: [
                    {
                        label: 'First Dataset',
                        data: this.ingresos().map((ingreso) => ingreso.ingresos),
                        fill: false,
                        borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                        tension: 0.4
                    }
                ]
            });
        
            this.options.set({
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            });
        }
    }
}
