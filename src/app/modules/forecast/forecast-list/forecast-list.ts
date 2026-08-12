import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ForecastRow {
  id: number;
  category: string;
  subCategory: string;
  month: string;
  year: number;
  actual: number;
  forecast: number;
  variance: number;
  variancePercent: number;
  status: 'On Track' | 'Over Budget' | 'Under Budget' | 'Critical';
  region: string;
  owner: string;
}

@Component({
  selector: 'app-forecast-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-list.html',
  styleUrl: './forecast-list.scss',
})
export class ForecastList {
  isLoading = true; // controls blur + glass overlay

  forecastData: ForecastRow[] = [
    { id: 1, category: 'Revenue', subCategory: 'Product Sales', month: 'Jan', year: 2026, actual: 452000, forecast: 430000, variance: 22000, variancePercent: 5.1, status: 'On Track', region: 'North', owner: 'R. Sharma' },
    { id: 2, category: 'Revenue', subCategory: 'Product Sales', month: 'Feb', year: 2026, actual: 468000, forecast: 445000, variance: 23000, variancePercent: 5.2, status: 'On Track', region: 'North', owner: 'R. Sharma' },
    { id: 3, category: 'Revenue', subCategory: 'Services', month: 'Jan', year: 2026, actual: 178000, forecast: 200000, variance: -22000, variancePercent: -11.0, status: 'Under Budget', region: 'South', owner: 'A. Iyer' },
    { id: 4, category: 'Revenue', subCategory: 'Services', month: 'Feb', year: 2026, actual: 185000, forecast: 205000, variance: -20000, variancePercent: -9.8, status: 'Under Budget', region: 'South', owner: 'A. Iyer' },
    { id: 5, category: 'Expense', subCategory: 'Salaries', month: 'Jan', year: 2026, actual: 310000, forecast: 300000, variance: 10000, variancePercent: 3.3, status: 'Over Budget', region: 'West', owner: 'M. Fernandes' },
    { id: 6, category: 'Expense', subCategory: 'Salaries', month: 'Feb', year: 2026, actual: 315000, forecast: 305000, variance: 10000, variancePercent: 3.3, status: 'Over Budget', region: 'West', owner: 'M. Fernandes' },
    { id: 7, category: 'Expense', subCategory: 'Marketing', month: 'Jan', year: 2026, actual: 62000, forecast: 75000, variance: -13000, variancePercent: -17.3, status: 'Critical', region: 'East', owner: 'S. Banerjee' },
    { id: 8, category: 'Expense', subCategory: 'Marketing', month: 'Feb', year: 2026, actual: 71000, forecast: 78000, variance: -7000, variancePercent: -9.0, status: 'Under Budget', region: 'East', owner: 'S. Banerjee' },
    { id: 9, category: 'Expense', subCategory: 'Operations', month: 'Jan', year: 2026, actual: 145000, forecast: 140000, variance: 5000, variancePercent: 3.6, status: 'On Track', region: 'North', owner: 'K. Verma' },
    { id: 10, category: 'Expense', subCategory: 'Operations', month: 'Feb', year: 2026, actual: 152000, forecast: 142000, variance: 10000, variancePercent: 7.0, status: 'Over Budget', region: 'North', owner: 'K. Verma' },
    { id: 11, category: 'Revenue', subCategory: 'Subscriptions', month: 'Mar', year: 2026, actual: 210000, forecast: 195000, variance: 15000, variancePercent: 7.7, status: 'On Track', region: 'South', owner: 'A. Iyer' },
    { id: 12, category: 'Expense', subCategory: 'IT Infrastructure', month: 'Mar', year: 2026, actual: 88000, forecast: 90000, variance: -2000, variancePercent: -2.2, status: 'On Track', region: 'West', owner: 'M. Fernandes' },
  ];

  get summary() {
    const totalActual = this.forecastData.reduce((sum, r) => sum + r.actual, 0);
    const totalForecast = this.forecastData.reduce((sum, r) => sum + r.forecast, 0);
    return {
      totalActual,
      totalForecast,
      totalVariance: totalActual - totalForecast,
      totalVariancePercent: ((totalActual - totalForecast) / totalForecast) * 100,
    };
  }

  // Returns a CSS-friendly class from the status label, e.g. "On Track" -> "on-track"
  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  // Simulates incoming/fetching data — replace with a real HTTP call
  loadData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
}