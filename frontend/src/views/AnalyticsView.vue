<template>
  <div class="analytics-view">
    <div class="page-header">
      <h1>Analytics Dashboard</h1>
      <div class="date-range">
        <button class="btn-outline">
          <i class="fas fa-calendar"></i>
          Last 30 days
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card" v-for="metric in keyMetrics" :key="metric.title">
        <div class="metric-icon" :style="{ backgroundColor: metric.color + '20' }">
          <i :class="metric.icon" :style="{ color: metric.color }"></i>
        </div>
        <div class="metric-content">
          <h3>{{ metric.title }}</h3>
          <p class="metric-value">{{ metric.value }}</p>
          <p class="metric-change" :class="{ 'positive': metric.change > 0, 'negative': metric.change < 0 }">
            {{ Math.abs(metric.change) }}% from last period
            <i :class="metric.change > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-header">
          <h3>Revenue Trend</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-demo"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>User Growth</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-demo"></div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-header">
          <h3>Top Products</h3>
          <button class="btn-text">View All</button>
        </div>
        <div class="product-list">
          <div class="product-item" v-for="product in topProducts" :key="product.id">
            <div class="product-info">
              <img :src="product.image" :alt="product.name" class="product-image" />
              <div>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-category">{{ product.category }}</div>
              </div>
            </div>
            <div class="product-stats">
              <div class="stat">
                <span class="label">Sales</span>
                <span class="value">{{ product.sales }}</span>
              </div>
              <div class="stat">
                <span class="label">Revenue</span>
                <span class="value">{{ product.revenue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-header">
          <h3>User Demographics</h3>
          <button class="btn-text">View All</button>
        </div>
        <div class="demographics-list">
          <div class="demographic-item" v-for="demo in demographics" :key="demo.category">
            <div class="demographic-info">
              <span class="category">{{ demo.category }}</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: demo.percentage + '%' }"></div>
              </div>
            </div>
            <span class="percentage">{{ demo.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyMetrics = ref([
  {
    title: 'Total Revenue',
    value: '$24,500',
    change: 12.5,
    icon: 'fas fa-dollar-sign',
    color: '#4CAF50'
  },
  {
    title: 'Active Users',
    value: '2,450',
    change: 8.2,
    icon: 'fas fa-users',
    color: '#2196F3'
  },
  {
    title: 'Conversion Rate',
    value: '24.5%',
    change: 4.3,
    icon: 'fas fa-chart-line',
    color: '#9C27B0'
  },
  {
    title: 'Avg. Order Value',
    value: '$156',
    change: -2.1,
    icon: 'fas fa-shopping-cart',
    color: '#FF9800'
  }
])

const topProducts = ref([
  {
    id: 1,
    name: 'Product A',
    category: 'Electronics',
    image: 'https://via.placeholder.com/40',
    sales: 245,
    revenue: '$12,250'
  },
  {
    id: 2,
    name: 'Product B',
    category: 'Clothing',
    image: 'https://via.placeholder.com/40',
    sales: 189,
    revenue: '$9,450'
  },
  {
    id: 3,
    name: 'Product C',
    category: 'Home & Living',
    image: 'https://via.placeholder.com/40',
    sales: 156,
    revenue: '$7,800'
  }
])

const demographics = ref([
  { category: '18-24', percentage: 25 },
  { category: '25-34', percentage: 35 },
  { category: '35-44', percentage: 20 },
  { category: '45-54', percentage: 15 },
  { category: '55+', percentage: 5 }
])
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;
@use '../styles/typography' as t;

.analytics-view {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background-color: var(--surface-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.5rem;
      }
    }

    .metric-content {
      h3 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0 0 0.5rem;
      }

      .metric-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
      }

      .metric-change {
        font-size: 0.875rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        &.positive {
          color: #4CAF50;
        }

        &.negative {
          color: #F44336;
        }
      }
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-card {
    background-color: var(--surface-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .chart-placeholder {
      height: 300px;
      background-color: var(--background-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .chart-demo {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, var(--primary-color-light) 25%, transparent 25%),
                    linear-gradient(-45deg, var(--primary-color-light) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, var(--primary-color-light) 75%),
                    linear-gradient(-45deg, transparent 75%, var(--primary-color-light) 75%);
        background-size: 20px 20px;
        opacity: 0.1;
      }
    }
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .analytics-card {
    background-color: var(--surface-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }
  }

  .product-list {
    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .product-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .product-image {
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }

        .product-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .product-category {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }

      .product-stats {
        display: flex;
        gap: 1.5rem;

        .stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          .label {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .value {
            font-weight: 500;
            color: var(--text-primary);
          }
        }
      }
    }
  }

  .demographics-list {
    .demographic-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .demographic-info {
        flex: 1;
        margin-right: 1rem;

        .category {
          display: block;
          font-size: 0.875rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          height: 6px;
          background-color: var(--background-color);
          border-radius: 3px;
          overflow: hidden;

          .progress {
            height: 100%;
            background-color: var(--primary-color);
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }
      }

      .percentage {
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }
}

// Utility Classes
.btn-outline {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--hover-color);
  }
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--hover-color);
    color: var(--text-primary);
  }
}

.btn-text {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .analytics-view {
    .charts-grid,
    .analytics-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 