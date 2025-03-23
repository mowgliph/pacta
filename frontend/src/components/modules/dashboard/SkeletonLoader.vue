<template>
  <div class="w-full animate-pulse">
    <div class="mb-6">
      <div class="h-9 w-3/5 max-w-[300px] mb-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-4 w-2/5 max-w-[250px] mb-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div class="h-10 w-[150px] float-right -mt-[50px] bg-gray-200 dark:bg-gray-700 rounded-md md:float-none md:mt-2"></div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in cards" :key="i" class="h-[120px] flex items-start p-4 bg-surface dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 mr-4 flex-shrink-0"></div>
        <div class="flex-1">
          <div class="h-8 w-4/5 mb-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 w-3/5 mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3.5 w-2/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-surface dark:bg-gray-800">
          <div class="h-6 w-3/5 max-w-[200px] bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div v-for="i in 4" :key="i" class="flex flex-col items-center text-center p-3 rounded bg-gray-100 dark:bg-gray-700/50">
              <div class="w-10 h-10 rounded-full mb-2 bg-gray-200 dark:bg-gray-700"></div>
              <div class="w-full">
                <div class="h-6 w-4/5 mx-auto mb-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="h-3 w-4/5 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          <div class="h-[200px] mt-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      
      <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-surface dark:bg-gray-800">
          <div class="h-6 w-3/5 max-w-[200px] bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div class="p-5">
          <div v-for="i in 4" :key="i" class="mb-4">
            <div class="flex justify-between mb-1">
              <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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

<style>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 