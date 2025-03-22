<template>
  <div class="skeleton-loader">
    <div class="skeleton-header">
      <div class="skeleton-title"></div>
      <div class="skeleton-subtitle"></div>
      <div class="skeleton-button"></div>
    </div>
    
    <div class="skeleton-cards">
      <div class="skeleton-card" v-for="i in cards" :key="i">
        <div class="skeleton-icon"></div>
        <div class="skeleton-content">
          <div class="skeleton-value"></div>
          <div class="skeleton-label"></div>
          <div class="skeleton-trend"></div>
        </div>
      </div>
    </div>
    
    <div class="skeleton-charts">
      <div class="skeleton-chart-card">
        <div class="skeleton-card-header">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-action"></div>
        </div>
        <div class="skeleton-card-content">
          <div class="skeleton-metrics">
            <div class="skeleton-metric" v-for="i in 4" :key="i">
              <div class="skeleton-metric-icon"></div>
              <div class="skeleton-metric-content">
                <div class="skeleton-metric-value"></div>
                <div class="skeleton-metric-label"></div>
              </div>
            </div>
          </div>
          <div class="skeleton-chart"></div>
        </div>
      </div>
      
      <div class="skeleton-chart-card">
        <div class="skeleton-card-header">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-action"></div>
        </div>
        <div class="skeleton-card-content">
          <div class="skeleton-category" v-for="i in 4" :key="i">
            <div class="skeleton-category-header">
              <div class="skeleton-category-name"></div>
              <div class="skeleton-category-count"></div>
            </div>
            <div class="skeleton-progress"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cards: {
    type: Number,
    default: 4
  }
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables' as v;
@use '../../../styles/colors' as c;
@use '../../../styles/mixins' as m;

@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.skeleton-loader {
  width: 100%;
  
  .skeleton-header, .skeleton-cards, .skeleton-charts {
    margin-bottom: v.$spacing-lg;
  }
  
  [class^="skeleton-"] {
    background: linear-gradient(
      to right,
      rgba(c.$color-border, 0.2) 8%,
      rgba(c.$color-border, 0.3) 18%,
      rgba(c.$color-border, 0.2) 33%
    );
    background-size: 800px 104px;
    border-radius: v.$border-radius-sm;
    animation: shimmer 1.5s infinite linear;
  }
  
  .skeleton-header {
    .skeleton-title {
      height: 36px;
      width: 60%;
      max-width: 300px;
      margin-bottom: v.$spacing-xs;
    }
    
    .skeleton-subtitle {
      height: 16px;
      width: 40%;
      max-width: 250px;
      margin-bottom: v.$spacing-md;
    }
    
    .skeleton-button {
      height: 40px;
      width: 150px;
      border-radius: v.$border-radius;
      float: right;
      margin-top: -50px;
    }
  }
  
  .skeleton-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: v.$spacing-md;
    
    .skeleton-card {
      height: 120px;
      display: flex;
      align-items: flex-start;
      padding: v.$spacing-lg;
      background-color: c.$color-surface;
      border-radius: v.$border-radius-md;
      box-shadow: v.$shadow-sm;
      border: 1px solid rgba(c.$color-border, 0.5);
      
      .skeleton-icon {
        width: 48px;
        height: 48px;
        border-radius: v.$border-radius;
        background-color: rgba(c.$color-border, 0.2);
        margin-right: v.$spacing-md;
        flex-shrink: 0;
      }
      
      .skeleton-content {
        flex: 1;
        
        .skeleton-value {
          height: 32px;
          width: 70%;
          margin-bottom: v.$spacing-xs;
        }
        
        .skeleton-label {
          height: 16px;
          width: 60%;
          margin-bottom: v.$spacing-sm;
        }
        
        .skeleton-trend {
          height: 14px;
          width: 40%;
        }
      }
    }
  }
  
  .skeleton-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: v.$spacing-lg;
    
    @media (max-width: v.$breakpoint-lg) {
      grid-template-columns: 1fr;
    }
    
    .skeleton-chart-card {
      background-color: c.$color-surface;
      border-radius: v.$border-radius-md;
      box-shadow: v.$shadow-sm;
      border: 1px solid rgba(c.$color-border, 0.5);
      overflow: hidden;
      
      .skeleton-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: v.$spacing-md v.$spacing-lg;
        border-bottom: 1px solid rgba(c.$color-border, 0.2);
        background-color: c.$color-surface;
        
        .skeleton-card-title {
          height: 24px;
          width: 60%;
          max-width: 200px;
        }
        
        .skeleton-card-action {
          height: 32px;
          width: 32px;
          border-radius: 50%;
        }
      }
      
      .skeleton-card-content {
        padding: v.$spacing-lg;
        
        .skeleton-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: v.$spacing-md;
          margin-bottom: v.$spacing-lg;
          
          .skeleton-metric {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: v.$spacing-md;
            border-radius: v.$border-radius;
            background-color: rgba(c.$color-border, 0.05);
            
            .skeleton-metric-icon {
              width: 42px;
              height: 42px;
              border-radius: 50%;
              margin-bottom: v.$spacing-sm;
            }
            
            .skeleton-metric-content {
              width: 100%;
              
              .skeleton-metric-value {
                height: 24px;
                width: 70%;
                margin: 0 auto v.$spacing-xs;
              }
              
              .skeleton-metric-label {
                height: 12px;
                width: 80%;
                margin: 0 auto;
              }
            }
          }
        }
        
        .skeleton-chart {
          height: 200px;
          margin-top: v.$spacing-md;
        }
        
        .skeleton-category {
          margin-bottom: v.$spacing-md;
          
          .skeleton-category-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: v.$spacing-xs;
            
            .skeleton-category-name {
              height: 16px;
              width: 50%;
            }
            
            .skeleton-category-count {
              height: 16px;
              width: 30px;
            }
          }
          
          .skeleton-progress {
            height: 8px;
            width: 100%;
            border-radius: v.$border-radius-pill;
          }
        }
      }
    }
  }
}

@media (max-width: v.$breakpoint-md) {
  .skeleton-header {
    .skeleton-button {
      float: none;
      margin-top: v.$spacing-sm;
    }
  }
  
  .skeleton-cards {
    grid-template-columns: 1fr;
  }
  
  .skeleton-charts {
    grid-template-columns: 1fr;
  }
}
</style> 