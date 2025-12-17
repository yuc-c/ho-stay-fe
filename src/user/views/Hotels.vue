<template>
  <Layout>
    <!-- 點擊外部關閉匯出選單和行動版選單 -->
    <div v-if="showExportMenu || showMobileMenu" class="fixed inset-0 z-40" @click="showExportMenu = false; showMobileMenu = false"></div>
    <!-- 修改：添加台灣特色背景裝飾 -->
    <div class="relative min-h-screen">
      <!-- 漸變背景（代表台灣的藍天和海洋） -->
      <div class="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50/30 via-cyan-50/20 to-teal-50/30 dark:from-blue-950/10 dark:via-cyan-950/5 dark:to-teal-950/10"></div>
      
      <!-- 台灣地圖輪廓（背景裝飾，更淡） -->
      <div class="fixed inset-0 -z-10 flex items-center justify-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <svg 
          viewBox="0 0 200 240" 
          class="h-full w-full max-w-6xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- 台灣本島輪廓（簡化版） -->
          <path 
            d="M 50 80 Q 60 70 70 75 Q 80 70 90 75 Q 100 70 110 80 Q 120 85 125 95 Q 130 105 135 115 Q 140 125 145 135 Q 150 145 145 155 Q 140 165 135 175 Q 130 185 125 195 Q 120 205 115 210 Q 110 215 105 220 Q 100 225 95 220 Q 90 215 85 210 Q 80 205 75 200 Q 70 195 65 190 Q 60 185 55 180 Q 50 175 48 170 Q 46 165 45 160 Q 44 155 45 150 Q 46 145 48 140 Q 50 135 52 130 Q 54 125 55 120 Q 56 115 55 110 Q 54 105 52 100 Q 50 95 50 90 Z"
            fill="currentColor"
            class="text-primary"
          />
          <!-- 澎湖群島（簡化） -->
          <circle cx="30" cy="150" r="3" fill="currentColor" class="text-primary" />
          <circle cx="35" cy="155" r="2.5" fill="currentColor" class="text-primary" />
          <circle cx="32" cy="160" r="2" fill="currentColor" class="text-primary" />
        </svg>
      </div>
      
      <!-- 裝飾性幾何圖案（更淡，不干擾內容） -->
      <div class="fixed top-20 right-20 h-64 w-64 rounded-full bg-primary/3 blur-3xl pointer-events-none"></div>
      <div class="fixed bottom-20 left-20 h-80 w-80 rounded-full bg-cyan-500/3 blur-3xl pointer-events-none"></div>
      <div class="fixed top-1/2 right-1/4 h-48 w-48 rounded-full bg-teal-500/3 blur-2xl pointer-events-none"></div>
      
      <div class="relative">
      <!-- 修改：標題行和地區篩選整合在一起，使用 sticky 懸浮，高度與側邊欄一致 -->
      <div class="sticky top-0 z-40 mb-4 h-16 flex items-center px-4 sm:px-8 bg-background/95 backdrop-blur-sm">
        <div class="w-full max-w-full">
        <div class="flex flex-row items-center justify-between gap-2 sm:gap-4">
          <!-- 左側：標題（響應式寬度） -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg flex-shrink-0">
              <Building2 class="h-6 w-6 text-primary-foreground" />
            </div>
            <div class="min-w-0 flex-1 flex flex-col justify-center">
              <h1 class="text-lg font-bold text-foreground leading-tight truncate">飯店管理</h1>
              <p class="hidden sm:block text-xs text-muted-foreground leading-tight truncate">管理您的飯店資訊、房型和設施</p>
            </div>
          </div>

            <!-- 右側：篩選、每頁數量選擇器、排序選擇器和操作按鈕 -->
            <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
              <!-- 桌面版：顯示所有控制項 -->
              <div class="hidden xl:flex items-center gap-2 2xl:gap-3 flex-nowrap">
                <!-- 桌面版：篩選按鈕和面板 -->
                <div class="hidden xl:block relative" data-filter-panel>
                  <!-- 篩選按鈕 -->
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-9 text-xs"
                    data-filter-button
                    @click.stop="showFilterPanel = !showFilterPanel"
                  >
                    <Filter class="mr-1.5 h-3.5 w-3.5" />
                    篩選
                    <Badge 
                      v-if="activeFilterCount > 0" 
                      variant="secondary" 
                      class="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
                    >
                      {{ activeFilterCount }}
                    </Badge>
                    <ChevronDown 
                      :class="['ml-1 h-3.5 w-3.5 transition-transform', showFilterPanel && 'rotate-180']"
                    />
                  </Button>

                  <!-- 篩選面板（下拉式）- 桌面版 -->
                  <div
                    v-if="showFilterPanel"
                    class="absolute top-full right-0 mt-2 z-50 w-[320px] sm:w-[400px] bg-card border border-border rounded-lg shadow-lg p-4 space-y-4"
                    @click.stop
                  >
                    <!-- 面板標題 -->
                    <div class="flex items-center justify-between pb-2 border-b border-border">
                      <div class="flex items-center gap-2">
                        <Filter class="h-4 w-4 text-muted-foreground" />
                        <span class="text-sm font-medium">篩選條件</span>
                      </div>
                      <Button
                        v-if="activeFilterCount > 0"
                        variant="ghost"
                        size="sm"
                        class="h-7 text-xs"
                        @click="clearFilters"
                      >
                        <X class="mr-1 h-3 w-3" />
                        清除全部
                      </Button>
                    </div>

                    <!-- 篩選選項 -->
                    <div class="space-y-3 max-h-[400px] overflow-y-auto">
                      <!-- 地區篩選 -->
                      <div v-if="cities.length > 0" class="space-y-2" @click.stop>
                        <Label class="text-xs font-medium text-muted-foreground">地區</Label>
                        <div class="grid grid-cols-2 gap-2">
                          <div @click.stop>
                            <Label html-for="city-filter" class="text-xs text-muted-foreground">城市</Label>
                            <Select
                              id="city-filter"
                              :value="selectedCityId?.toString() || ''"
                              @change.stop="handleCityChange"
                              @click.stop
                              class="h-8 text-xs mt-1"
                            >
                              <option value="">全部城市</option>
                              <option
                                v-for="city in cities"
                                :key="city.id"
                                :value="city.id.toString()"
                              >
                                {{ city.name }}
                              </option>
                            </Select>
                          </div>
                          <div @click.stop>
                            <Label html-for="district-filter" class="text-xs text-muted-foreground">行政區</Label>
                            <Select
                              id="district-filter"
                              :value="selectedDistrictId?.toString() || ''"
                              @change.stop="handleDistrictChange"
                              @click.stop
                              :disabled="!selectedCityId"
                              class="h-8 text-xs mt-1"
                            >
                              <option value="">全部行政區</option>
                              <option
                                v-for="district in districts"
                                :key="district.id"
                                :value="district.id.toString()"
                              >
                                {{ district.name }}
                              </option>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <!-- 營業狀態篩選 -->
                      <div class="space-y-2" @click.stop>
                        <Label html-for="business-status-filter" class="text-xs font-medium text-muted-foreground">營業狀態</Label>
                        <Select
                          id="business-status-filter"
                          :value="selectedBusinessStatus === null ? '' : selectedBusinessStatus.toString()"
                          @change.stop="handleBusinessStatusChange"
                          @click.stop
                          class="h-8 text-xs"
                        >
                          <option value="">全部狀態</option>
                          <option value="true">營業中</option>
                          <option value="false">停業中</option>
                        </Select>
                      </div>

                      <!-- 飯店類型篩選 -->
                      <div v-if="availableHotelTypes.length > 0" class="space-y-2" @click.stop>
                        <Label html-for="hotel-type-filter" class="text-xs font-medium text-muted-foreground">飯店類型</Label>
                        <Select
                          id="hotel-type-filter"
                          :value="selectedHotelTypeId?.toString() || ''"
                          @change.stop="handleHotelTypeChange"
                          @click.stop
                          class="h-8 text-xs"
                        >
                          <option value="">全部類型</option>
                          <option
                            v-for="type in availableHotelTypes"
                            :key="type.id"
                            :value="type.id.toString()"
                          >
                            {{ getHotelTypeLabel(type) }}
                          </option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 每頁顯示數量選擇器 -->
                <div class="flex items-center gap-2">
                  <Label html-for="page-size-select-top" class="hidden xl:inline text-xs text-muted-foreground whitespace-nowrap">
                    每頁顯示：
                  </Label>
                  <Select
                    id="page-size-select-top"
                    :value="pageSize.toString()"
                    @change="handlePageSizeChange"
                    class="h-9 w-16 text-xs"
                  >
                    <option v-for="size in pageSizeOptions" :key="size" :value="size.toString()">
                      {{ size }}
                    </option>
                  </Select>
                </div>

                <!-- 排序選擇器 -->
                <div class="flex items-center gap-2">
                  <Label html-for="sort-by-select-top" class="hidden xl:inline text-xs text-muted-foreground whitespace-nowrap">
                    排序：
                  </Label>
                  <Select
                    id="sort-by-select-top"
                    :value="sortBy === null ? 'null' : sortBy"
                    @change="handleSortChange"
                    class="h-9 w-32 text-xs"
                  >
                    <option v-for="option in sortOptions" :key="option.value || 'null'" :value="option.value === null ? 'null' : option.value">
                      {{ option.label }}
                    </option>
                  </Select>
                  <!-- 排序方向選擇器（僅在選擇了排序欄位時顯示） -->
                  <Select
                    v-if="sortBy !== null"
                    id="sort-order-select-top"
                    :value="sortOrder"
                    @change="handleSortOrderChange"
                    class="h-9 w-20 text-xs"
                  >
                    <option v-for="option in sortOrderOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </Select>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex gap-1.5 lg:gap-2 flex-shrink-0">
                  <!-- 佈局切換按鈕組 -->
                  <div class="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                    <Button
                      v-for="option in layoutOptions"
                      :key="option.value"
                      :variant="layoutMode === option.value ? 'default' : 'ghost'"
                      size="sm"
                      class="h-8 px-2 lg:px-3"
                      @click="handleLayoutChange(option.value)"
                      :title="option.label"
                    >
                      <component :is="option.icon" class="h-4 w-4" />
                    </Button>
                  </div>
                  <!-- 匯出按鈕 -->
                  <div class="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-10 px-2 lg:px-4"
                      @click="showExportMenu = !showExportMenu"
                    >
                      <Download class="h-5 w-5 xl:mr-2" />
                      <span class="hidden xl:inline">匯出</span>
                    </Button>
                    <!-- 匯出選單 -->
                    <div
                      v-if="showExportMenu"
                      class="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-background shadow-lg z-50"
                      @click.stop
                    >
                      <div class="p-1">
                        <button
                          class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                          @click="exportToPDF"
                        >
                          <FileText class="h-4 w-4" />
                          匯出為 PDF
                        </button>
                        <button
                          class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                          @click="exportToCSV"
                        >
                          <FileText class="h-4 w-4" />
                          匯出為 CSV
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button @click="fetchHotels(currentPage)" variant="outline" size="sm" class="h-10 px-2 xl:px-4" :disabled="loading">
                    <RefreshCw class="h-5 w-5 xl:mr-2" :class="{ 'animate-spin': loading }" />
                    <span class="hidden xl:inline">刷新</span>
                  </Button>
                </div>
              </div>

              <!-- 行動版：收納到選單 -->
              <div class="xl:hidden relative">
                <Button
                  variant="outline"
                  size="sm"
                  class="h-9"
                  @click="showMobileMenu = !showMobileMenu"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
                <!-- 行動版選單 -->
                <div
                  v-if="showMobileMenu"
                  class="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-background shadow-lg z-50"
                  @click.stop
                >
                  <div class="p-2 space-y-2">
                    <!-- 篩選 -->
                    <button
                      class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      @click="showFilterPanel = !showFilterPanel; showMobileMenu = false"
                    >
                      <div class="flex items-center gap-2">
                        <Filter class="h-4 w-4" />
                        <span>篩選</span>
                        <Badge 
                          v-if="activeFilterCount > 0" 
                          variant="secondary" 
                          class="h-4 min-w-4 px-1 text-[10px]"
                        >
                          {{ activeFilterCount }}
                        </Badge>
                      </div>
                    </button>
                    <div class="border-t border-border my-1"></div>
                    <!-- 每頁顯示 -->
                    <div class="flex items-center justify-between px-2 py-1.5">
                      <Label html-for="page-size-mobile" class="text-xs text-muted-foreground">每頁顯示</Label>
                      <Select
                        id="page-size-mobile"
                        :value="pageSize.toString()"
                        @change="handlePageSizeChange"
                        class="h-8 w-16 text-xs"
                      >
                        <option v-for="size in pageSizeOptions" :key="size" :value="size.toString()">
                          {{ size }}
                        </option>
                      </Select>
                    </div>
                    <!-- 排序 -->
                    <div class="flex items-center justify-between px-2 py-1.5">
                      <Label html-for="sort-by-mobile" class="text-xs text-muted-foreground">排序</Label>
                      <Select
                        id="sort-by-mobile"
                        :value="sortBy === null ? 'null' : sortBy"
                        @change="handleSortChange"
                        class="h-8 w-32 text-xs"
                      >
                        <option v-for="option in sortOptions" :key="option.value || 'null'" :value="option.value === null ? 'null' : option.value">
                          {{ option.label }}
                        </option>
                      </Select>
                    </div>
                    <!-- 排序方向 -->
                    <div v-if="sortBy !== null" class="flex items-center justify-between px-2 py-1.5">
                      <Label html-for="sort-order-mobile" class="text-xs text-muted-foreground">方向</Label>
                      <Select
                        id="sort-order-mobile"
                        :value="sortOrder"
                        @change="handleSortOrderChange"
                        class="h-8 w-20 text-xs"
                      >
                        <option v-for="option in sortOrderOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </Select>
                    </div>
                    <div class="border-t border-border my-1"></div>
                    <!-- 佈局切換 -->
                    <div class="px-2 py-1.5">
                      <Label class="text-xs text-muted-foreground mb-1.5 block">檢視模式</Label>
                      <div class="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                        <Button
                          v-for="option in layoutOptions"
                          :key="option.value"
                          :variant="layoutMode === option.value ? 'default' : 'ghost'"
                          size="sm"
                          class="h-8 flex-1"
                          @click="handleLayoutChange(option.value)"
                          :title="option.label"
                        >
                          <component :is="option.icon" class="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div class="border-t border-border my-1"></div>
                    <!-- 匯出 -->
                    <button
                      class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      @click="showExportMenu = !showExportMenu; showMobileMenu = false"
                    >
                      <Download class="h-4 w-4" />
                      匯出
                    </button>
                    <!-- 刷新 -->
                    <button
                      class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      @click="fetchHotels(currentPage); showMobileMenu = false"
                      :disabled="loading"
                    >
                      <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
                      刷新
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 行動版：篩選面板（側邊滑出） -->
      <div
        v-if="showFilterPanel"
        class="xl:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
        @click="showFilterPanel = false"
      >
        <div
          class="absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-card border-l border-border shadow-xl overflow-y-auto"
          @click.stop
        >
          <div class="p-4 space-y-4">
            <!-- 面板標題 -->
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <div class="flex items-center gap-2">
                <Filter class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">篩選條件</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                class="h-7 w-7 p-0"
                @click="showFilterPanel = false"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>

            <!-- 篩選選項 -->
            <div class="space-y-3">
              <!-- 地區篩選 -->
              <div v-if="cities.length > 0" class="space-y-2" @click.stop>
                <Label class="text-xs font-medium text-muted-foreground">地區</Label>
                <div class="grid grid-cols-2 gap-2">
                  <div @click.stop>
                    <Label html-for="city-filter-mobile" class="text-xs text-muted-foreground">城市</Label>
                    <Select
                      id="city-filter-mobile"
                      :value="selectedCityId?.toString() || ''"
                      @change.stop="handleCityChange"
                      @click.stop
                      class="h-8 text-xs mt-1"
                    >
                      <option value="">全部城市</option>
                      <option
                        v-for="city in cities"
                        :key="city.id"
                        :value="city.id.toString()"
                      >
                        {{ city.name }}
                      </option>
                    </Select>
                  </div>
                  <div @click.stop>
                    <Label html-for="district-filter-mobile" class="text-xs text-muted-foreground">行政區</Label>
                    <Select
                      id="district-filter-mobile"
                      :value="selectedDistrictId?.toString() || ''"
                      @change.stop="handleDistrictChange"
                      @click.stop
                      :disabled="!selectedCityId"
                      class="h-8 text-xs mt-1"
                    >
                      <option value="">全部行政區</option>
                      <option
                        v-for="district in districts"
                        :key="district.id"
                        :value="district.id.toString()"
                      >
                        {{ district.name }}
                      </option>
                    </Select>
                  </div>
                </div>
              </div>

              <!-- 營業狀態篩選 -->
              <div class="space-y-2" @click.stop>
                <Label html-for="business-status-filter-mobile" class="text-xs font-medium text-muted-foreground">營業狀態</Label>
                <Select
                  id="business-status-filter-mobile"
                  :value="selectedBusinessStatus === null ? '' : selectedBusinessStatus.toString()"
                  @change.stop="handleBusinessStatusChange"
                  @click.stop
                  class="h-8 text-xs"
                >
                  <option value="">全部狀態</option>
                  <option value="true">營業中</option>
                  <option value="false">停業中</option>
                </Select>
              </div>

              <!-- 飯店類型篩選 -->
              <div v-if="availableHotelTypes.length > 0" class="space-y-2" @click.stop>
                <Label html-for="hotel-type-filter-mobile" class="text-xs font-medium text-muted-foreground">飯店類型</Label>
                <Select
                  id="hotel-type-filter-mobile"
                  :value="selectedHotelTypeId?.toString() || ''"
                  @change.stop="handleHotelTypeChange"
                  @click.stop
                  class="h-8 text-xs"
                >
                  <option value="">全部類型</option>
                  <option
                    v-for="type in availableHotelTypes"
                    :key="type.id"
                    :value="type.id.toString()"
                  >
                    {{ getHotelTypeLabel(type) }}
                  </option>
                </Select>
              </div>
            </div>

            <!-- 清除按鈕 -->
            <div class="pt-4 border-t border-border">
              <Button
                v-if="activeFilterCount > 0"
                variant="outline"
                size="sm"
                class="w-full"
                @click="clearFilters"
              >
                <X class="mr-2 h-4 w-4" />
                清除全部篩選
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 內容區域 -->
      <div class="p-8 pt-4 max-w-7xl mx-auto">
      <!-- 修改：改進載入狀態顯示 -->
      <div v-if="loading" class="flex h-64 flex-col items-center justify-center">
        <RefreshCw class="mb-4 h-8 w-8 animate-spin text-primary" />
        <div class="text-muted-foreground">載入中...</div>
      </div>

      <Card v-else-if="hotels.length === 0" class="shadow-soft">
        <CardContent class="flex flex-col items-center justify-center py-16">
          <!-- 修改：使用更專業的插圖和顏色 -->
          <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
            <Building2 class="h-12 w-12 text-primary" />
          </div>
          <!-- 根據是否有篩選條件顯示不同的訊息 -->
          <h3 class="mb-2 text-2xl font-semibold text-foreground">
            {{ hasActiveFilters ? '沒有符合篩選條件的飯店' : '還沒有飯店' }}
          </h3>
          <p class="mb-6 text-center text-muted-foreground max-w-md">
            <template v-if="hasActiveFilters">
              請嘗試調整篩選條件，或
              <Button 
                variant="link" 
                class="p-0 h-auto text-primary underline" 
                @click="clearFilters"
              >
                清除所有篩選
              </Button>
              以查看所有飯店
            </template>
            <template v-else>
              開始新增您的第一家飯店，讓旅客體驗優質的住宿服務！
            </template>
          </p>
          <Button 
            v-if="!hasActiveFilters" 
            @click="navigate('/hotels/setup')" 
            size="lg" 
            class="shadow-md"
          >
            <ListChecks class="mr-2 h-5 w-5" />
            引導式新增
          </Button>
          <Button 
            v-else 
            @click="clearFilters" 
            size="lg" 
            variant="outline"
            class="shadow-md"
          >
            <X class="mr-2 h-5 w-5" />
            清除篩選條件
          </Button>
        </CardContent>
      </Card>

      <!-- 網格佈局 -->
      <div v-else-if="layoutMode === 'grid'" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="hotel in hotels"
          :key="hotel.id"
          class="shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border border-border/50"
        >
          <!-- 封面照片 -->
          <div class="relative w-full overflow-hidden bg-muted" style="aspect-ratio: 16 / 9;">
            <img
              v-if="getCoverPhoto(hotel)"
              :src="`${path}?photoUrl=${getCoverPhoto(hotel).url}`"
              :alt="`${hotel.name} 封面照片`"
              :class="getImageClass(hotel)"
              :style="getImageStyle(hotel)"
              loading="lazy"
              @error="handleImageError"
              @load="handleImageLoad($event, hotel)"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50"
            >
              <div class="text-center">
                <Image class="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p class="mt-2 text-sm text-muted-foreground">尚未上傳封面照片</p>
              </div>
            </div>
            <!-- 封面標籤 -->
            <div
              v-if="getCoverPhoto(hotel)"
              class="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-sm"
            >
              封面
            </div>
          </div>

          <CardHeader class="pb-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <CardTitle class="text-xl mb-2 leading-tight">{{ hotel.name }}</CardTitle>
                <div class="flex gap-2 flex-wrap">
                  <Badge variant="secondary" class="text-xs">
                    {{ getHotelTypeLabel(hotel.hotelType) }}
                  </Badge>
                  <Badge :variant="(hotel.businessStatus === true || hotel.businessStatus === 1) ? 'default' : 'destructive'" class="text-xs">
                    {{ (hotel.businessStatus === true || hotel.businessStatus === 1) ? '營業中' : '停業' }}
                  </Badge>
                </div>
                <!-- 停業狀態提示 -->
                <div v-if="!(hotel.businessStatus === true || hotel.businessStatus === 1)" class="mt-2 inline-block rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-2 py-1 max-w-fit">
                  <p class="text-xs font-medium text-amber-800 dark:text-amber-200">
                    ★ 暫停服務中
                  </p>
                </div>
              </div>
            </div>
            <CardDescription v-if="hotel.description" class="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {{ hotel.description }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <!-- 註冊進度 -->
            <div v-if="getHotelProgress(hotel.id)" class="mb-4 text-base">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-foreground">註冊進度</span>
                <span class="font-bold text-lg" :class="getHotelProgress(hotel.id).percentage === 100 ? 'text-green-600 dark:text-green-500' : 'text-primary'">
                  {{ getHotelProgress(hotel.id).percentage }}%
                </span>
                <span v-if="getHotelProgress(hotel.id).percentage === 100 && !(hotel.businessStatus === true || hotel.businessStatus === 1)" class="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-2 py-1 text-sm font-medium text-green-800 dark:text-green-200">
                  完成所有步驟，可以開放營業了！
                </span>
              </div>
              <!-- 待完成步驟 -->
              <div v-if="getHotelProgress(hotel.id).pendingSteps.length > 0" class="mt-2">
                <p class="text-xs text-muted-foreground mb-1">待完成步驟：</p>
                <div class="flex flex-wrap gap-1">
                  <Button
                    v-for="(step, index) in getHotelProgress(hotel.id).pendingSteps"
                    :key="index"
                    variant="ghost"
                    size="sm"
                    class="h-6 text-xs"
                    @click="handleContinueRegistration(hotel.id, step.key)"
                  >
                    {{ step.name }}
                  </Button>
                </div>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-start gap-2 text-muted-foreground">
                <MapPin class="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  <template v-if="hotel.district">
                    {{ hotel.district.city?.name || '' }}{{ hotel.district.name || '' }}
                  </template>
                  {{ hotel.address }}
                </span>
              </div>
              <div v-if="hotel.phone" class="flex items-center gap-2 text-muted-foreground">
                <Phone class="h-4 w-4 flex-shrink-0" />
                <span>{{ formatPhone(hotel.phone) }}</span>
              </div>
              <div v-if="hotel.localCall" class="flex items-center gap-2 text-muted-foreground">
                <!-- 傳統有線電話圖標（使用圖片，與手機圖標顏色一致） -->
                <img 
                  :src="phoneIcon" 
                  alt="市話" 
                  class="h-4 w-4 flex-shrink-0 object-contain phone-icon-muted"
                  @error="handlePhoneIconError"
                />
                <span>{{ formatLocalCall(hotel.localCall) }}</span>
              </div>
            </div>

            <!-- 修改：添加統計資訊顯示（使用前端計算） -->
            <div class="mt-4 flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-1.5">
                <Bed class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">房型</span>
                <span class="font-semibold text-foreground">{{ getRoomTypeCount(hotel.id) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Building2 class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">設施</span>
                <span class="font-semibold text-foreground">{{ hotel.facilityIds?.length || 0 }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Image class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">照片</span>
                <span class="font-semibold text-foreground">{{ hotel.photos?.length || 0 }}</span>
              </div>
              <!-- 附早餐標示（設施與服務） -->
              <div v-if="hasBreakfast(hotel)" class="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <UtensilsCrossed class="h-4 w-4" />
                <span class="font-medium">附早餐</span>
              </div>
            </div>
            <!-- 房型列表（顯示前幾個房型和床型）- 網格視圖 -->
            <div v-if="getHotelRoomTypes(hotel.id) && getHotelRoomTypes(hotel.id).length > 0" class="mt-3 pt-3 border-t border-border">
              <div class="flex items-start gap-2">
                <Bed class="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <div class="flex-1">
                  <p class="text-xs text-muted-foreground mb-1.5">房型與床型：</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="(roomType, index) in getDisplayedRoomTypes(hotel.id)"
                      :key="roomType.id || index"
                      class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
                    >
                      {{ roomType.name || '未命名房型' }} - {{ getRoomTypeBedTypesText(roomType) }}
                    </span>
                    <button
                      v-if="getHotelRoomTypes(hotel.id).length > 3"
                      @click="toggleRoomTypesExpand(hotel.id)"
                      class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {{ isRoomTypesExpanded(hotel.id) ? '收起' : `+${getHotelRoomTypes(hotel.id).length - 3} 更多房型` }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 設施列表（顯示前幾個設施名稱）- 網格視圖 -->
            <div v-if="hotel.facilityIds && hotel.facilityIds.length > 0" class="mt-3 pt-3 border-t border-border">
              <div class="flex items-start gap-2">
                <Building2 class="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <div class="flex-1">
                  <p class="text-xs text-muted-foreground mb-1.5">設施：</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="(facilityId, index) in getDisplayedFacilities(hotel)"
                      :key="facilityId"
                      class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
                    >
                      {{ getFacilityName(facilityId) }}
                    </span>
                    <button
                      v-if="getHotelFacilities(hotel).length > 6"
                      @click="toggleFacilitiesExpand(hotel.id)"
                      class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {{ isFacilitiesExpanded(hotel.id) ? '收起' : `+${getHotelFacilities(hotel).length - 6} 更多` }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                class="transition-all hover:scale-105"
                @click="navigate(`/hotels/${hotel.id}`)"
              >
                <Edit class="mr-2 h-4 w-4" />
                編輯
              </Button>
              <Button
                variant="secondary"
                size="sm"
                class="transition-all hover:scale-105"
                @click="navigate(`/hotels/${hotel.id}/room-types`)"
              >
                <Bed class="mr-2 h-4 w-4" />
                房型
              </Button>
              <Button
                variant="secondary"
                size="sm"
                class="transition-all hover:scale-105"
                @click="navigate(`/hotels/${hotel.id}/images`)"
              >
                <Image class="mr-2 h-4 w-4" />
                照片
              </Button>
              <Button
                variant="secondary"
                size="sm"
                class="transition-all hover:scale-105"
                @click="navigate(`/hotels/${hotel.id}/facilities`)"
              >
                <Building2 class="mr-2 h-4 w-4" />
                設施
              </Button>
              <!-- 繼續註冊按鈕 -->
              <Button
                v-if="getHotelProgress(hotel.id).percentage < 100"
                variant="default"
                size="sm"
                @click="navigate(`/hotels/${hotel.id}/setup`)"
              >
                繼續註冊
              </Button>
              <!-- 停業/營業切換按鈕（軟刪除） -->
              <Button
                :variant="(hotel.businessStatus === true || hotel.businessStatus === 1) ? 'outline' : 'secondary'"
                size="icon"
                @click="handleToggleBusinessStatus(hotel)"
                :title="(hotel.businessStatus === true || hotel.businessStatus === 1) ? '切換為停業' : '切換為營業'"
              >
                <PowerOff v-if="(hotel.businessStatus === true || hotel.businessStatus === 1)" class="h-4 w-4" />
                <Power v-else class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 列表佈局 -->
      <div v-else class="space-y-4">
        <Card
          v-for="hotel in hotels"
          :key="hotel.id"
          class="shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden border border-border/50"
        >
          <div class="flex flex-col md:flex-row gap-0">
            <!-- 封面照片（列表佈局） -->
            <div class="relative w-full md:w-56 flex-shrink-0 overflow-hidden bg-muted" style="aspect-ratio: 16 / 9;">
              <img
                v-if="getCoverPhoto(hotel)"
                :src="`${path}?photoUrl=${getCoverPhoto(hotel).url}`"
                :alt="`${hotel.name} 封面照片`"
                :class="getImageClass(hotel)"
                :style="getImageStyle(hotel)"
                loading="lazy"
                @error="handleImageError"
                @load="handleImageLoad($event, hotel)"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50"
              >
                <div class="text-center">
                  <Image class="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p class="mt-1 text-xs text-muted-foreground">無封面照片</p>
                </div>
              </div>
              <!-- 封面標籤 -->
              <div
                v-if="getCoverPhoto(hotel)"
                class="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm backdrop-blur-sm"
              >
                封面
              </div>
            </div>

            <!-- 飯店資訊（列表佈局 - 緊湊版） -->
            <div class="flex-1 flex flex-col min-w-0">
              <CardHeader class="pb-2 px-4 md:px-5">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <CardTitle class="text-lg mb-1.5 leading-tight">{{ hotel.name }}</CardTitle>
                    <div class="flex gap-1.5 flex-wrap">
                      <Badge variant="secondary" class="text-xs">
                        {{ getHotelTypeLabel(hotel.hotelType) }}
                      </Badge>
                      <Badge :variant="(hotel.businessStatus === true || hotel.businessStatus === 1) ? 'default' : 'destructive'" class="text-xs">
                        {{ (hotel.businessStatus === true || hotel.businessStatus === 1) ? '營業中' : '停業' }}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription v-if="hotel.description" class="mt-1.5 line-clamp-2 text-sm">
                  {{ hotel.description }}
                </CardDescription>
              </CardHeader>
              
              <CardContent class="pt-0 px-4 md:px-5 pb-4">
                <!-- 註冊進度（緊湊版） -->
                <div v-if="getHotelProgress(hotel.id)" class="mb-3 text-sm">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-medium text-foreground">註冊進度</span>
                    <span class="font-bold text-base" :class="getHotelProgress(hotel.id).percentage === 100 ? 'text-green-600 dark:text-green-500' : 'text-primary'">
                      {{ getHotelProgress(hotel.id).percentage }}%
                    </span>
                    <span v-if="getHotelProgress(hotel.id).percentage === 100 && !(hotel.businessStatus === true || hotel.businessStatus === 1)" class="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-2 py-1 text-sm font-medium text-green-800 dark:text-green-200">
                      完成所有步驟，可以開放營業了！
                    </span>
                  </div>
                  <!-- 待完成步驟 -->
                  <div v-if="getHotelProgress(hotel.id).pendingSteps.length > 0" class="mt-1.5">
                    <p class="text-xs text-muted-foreground mb-0.5">待完成步驟：</p>
                    <div class="flex flex-wrap gap-0.5">
                      <Button
                        v-for="(step, index) in getHotelProgress(hotel.id).pendingSteps.slice(0, 2)"
                        :key="index"
                        variant="ghost"
                        size="sm"
                        class="h-5 text-xs px-2"
                        @click="handleContinueRegistration(hotel.id, step.key)"
                      >
                        {{ step.name }}
                      </Button>
                      <span v-if="getHotelProgress(hotel.id).pendingSteps.length > 2" class="text-xs text-muted-foreground px-2 py-0.5">
                        +{{ getHotelProgress(hotel.id).pendingSteps.length - 2 }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin class="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span class="line-clamp-1">
                      <template v-if="hotel.district">
                        {{ hotel.district.city?.name || '' }}{{ hotel.district.name || '' }}
                      </template>
                      {{ hotel.address }}
                    </span>
                  </div>
                  <div v-if="hotel.phone" class="flex items-center gap-1.5 text-muted-foreground">
                    <Phone class="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{{ formatPhone(hotel.phone) }}</span>
                  </div>
                  <div v-if="hotel.localCall" class="flex items-center gap-1.5 text-muted-foreground">
                    <!-- 傳統有線電話圖標（使用圖片，與手機圖標顏色一致） -->
                    <img 
                      :src="phoneIcon" 
                      alt="市話" 
                      class="h-3.5 w-3.5 flex-shrink-0 object-contain phone-icon-muted"
                      @error="handlePhoneIconError"
                    />
                    <span>{{ formatLocalCall(hotel.localCall) }}</span>
                  </div>
                </div>

                <!-- 統計資訊 -->
                <div class="mt-3 flex flex-wrap gap-3 text-xs">
                  <div class="flex items-center gap-1">
                    <Bed class="h-3.5 w-3.5 text-muted-foreground" />
                    <span class="text-muted-foreground">房型</span>
                    <span class="font-semibold text-foreground">{{ getRoomTypeCount(hotel.id) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Building2 class="h-3.5 w-3.5 text-muted-foreground" />
                    <span class="text-muted-foreground">設施</span>
                    <span class="font-semibold text-foreground">{{ hotel.facilityIds?.length || 0 }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Image class="h-3.5 w-3.5 text-muted-foreground" />
                    <span class="text-muted-foreground">照片</span>
                    <span class="font-semibold text-foreground">{{ hotel.photos?.length || 0 }}</span>
                  </div>
                  <!-- 附早餐標示（設施與服務） -->
                  <div v-if="hasBreakfast(hotel)" class="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <UtensilsCrossed class="h-3.5 w-3.5" />
                    <span class="font-medium">附早餐</span>
                  </div>
                </div>

                <!-- 房型列表（顯示前幾個房型和床型）- 列表視圖 -->
                <div v-if="getHotelRoomTypes(hotel.id) && getHotelRoomTypes(hotel.id).length > 0" class="mt-2 pt-2 border-t border-border">
                  <div class="flex items-start gap-1.5">
                    <Bed class="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <div class="flex-1">
                      <p class="text-xs text-muted-foreground mb-1">房型與床型：</p>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(roomType, index) in getDisplayedRoomTypes(hotel.id)"
                          :key="roomType.id || index"
                          class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
                        >
                          {{ roomType.name || '未命名房型' }} - {{ getRoomTypeBedTypesText(roomType) }}
                        </span>
                        <button
                          v-if="getHotelRoomTypes(hotel.id).length > 3"
                          @click="toggleRoomTypesExpand(hotel.id)"
                          class="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          {{ isRoomTypesExpanded(hotel.id) ? '收起' : `+${getHotelRoomTypes(hotel.id).length - 3} 更多房型` }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 設施列表（顯示前幾個設施名稱）- 列表視圖 -->
                <div v-if="hotel.facilityIds && hotel.facilityIds.length > 0" class="mt-2 pt-2 border-t border-border">
                  <div class="flex items-start gap-1.5">
                    <Building2 class="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <div class="flex-1">
                      <p class="text-xs text-muted-foreground mb-1">設施：</p>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(facilityId, index) in getDisplayedFacilities(hotel)"
                          :key="facilityId"
                          class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
                        >
                          {{ getFacilityName(facilityId) }}
                        </span>
                        <button
                          v-if="getHotelFacilities(hotel).length > 6"
                          @click="toggleFacilitiesExpand(hotel.id)"
                          class="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          {{ isFacilitiesExpanded(hotel.id) ? '收起' : `+${getHotelFacilities(hotel).length - 6} 更多` }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 操作按鈕 -->
                <div class="mt-3 pt-3 border-t border-border flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-xs h-7 transition-all hover:scale-105"
                    @click="navigate(`/hotels/${hotel.id}`)"
                  >
                    <Edit class="mr-1.5 h-3.5 w-3.5" />
                    編輯
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="text-xs h-7 transition-all hover:scale-105"
                    @click="navigate(`/hotels/${hotel.id}/room-types`)"
                  >
                    <Bed class="mr-1.5 h-3.5 w-3.5" />
                    房型
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="text-xs h-7 transition-all hover:scale-105"
                    @click="navigate(`/hotels/${hotel.id}/images`)"
                  >
                    <Image class="mr-1.5 h-3.5 w-3.5" />
                    照片
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="text-xs h-7 transition-all hover:scale-105"
                    @click="navigate(`/hotels/${hotel.id}/facilities`)"
                  >
                    <Building2 class="mr-1.5 h-3.5 w-3.5" />
                    設施
                  </Button>
                  <!-- 停業/營業切換按鈕（軟刪除） -->
                  <Button
                    :variant="(hotel.businessStatus === true || hotel.businessStatus === 1) ? 'outline' : 'secondary'"
                    size="icon"
                    class="h-7 w-7"
                    @click="handleToggleBusinessStatus(hotel)"
                    :title="(hotel.businessStatus === true || hotel.businessStatus === 1) ? '切換為停業' : '切換為營業'"
                  >
                    <PowerOff v-if="(hotel.businessStatus === true || hotel.businessStatus === 1)" class="h-3.5 w-3.5" />
                    <Power v-else class="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
      
      <!-- 修改：分頁組件 - 固定在底部（當有飯店時顯示，即使只有一頁也顯示每頁數量選擇器） -->
      <div v-if="!loading && totalElements > 0" class="fixed bottom-0 left-64 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm py-3 px-4 shadow-lg">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 flex-wrap">
          <!-- 左側：分頁資訊 -->
          <div class="text-sm text-muted-foreground whitespace-nowrap">
            顯示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalElements) }} 間，
            共 {{ totalElements }} 間飯店
          </div>

          <!-- 中間：分頁按鈕（置中，僅在多頁時顯示） -->
          <div v-if="totalPages > 1" class="flex items-center gap-2">
            <!-- 上一頁按鈕 -->
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4 mr-1" />
              上一頁
            </Button>

            <!-- 頁碼按鈕 -->
            <div class="flex items-center gap-1">
              <!-- 顯示第一頁 -->
              <Button
                v-if="currentPage > 3"
                variant="outline"
                size="sm"
                @click="changePage(1)"
              >
                1
              </Button>
              <span v-if="currentPage > 4" class="px-2 text-muted-foreground">...</span>

              <!-- 顯示當前頁前後的頁碼 -->
              <template v-for="page in getPageNumbers()" :key="page">
                <Button
                  :variant="page === currentPage ? 'default' : 'outline'"
                  size="sm"
                  @click="changePage(page)"
                >
                  {{ page }}
                </Button>
              </template>

              <!-- 顯示最後一頁 -->
              <span v-if="currentPage < totalPages - 3" class="px-2 text-muted-foreground">...</span>
              <Button
                v-if="currentPage < totalPages - 2 && totalPages > 1"
                variant="outline"
                size="sm"
                @click="changePage(totalPages)"
              >
                {{ totalPages }}
              </Button>
            </div>

            <!-- 下一頁按鈕 -->
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              下一頁
              <ChevronRight class="h-4 w-4 ml-1" />
            </Button>
          </div>

          <!-- 右側：空白區域（用於平衡佈局） -->
          <div class="text-sm text-muted-foreground whitespace-nowrap invisible">
            顯示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalElements) }} 間，
            共 {{ totalElements }} 間飯店
          </div>
        </div>
      </div>

      <!-- 修改：為固定分頁添加底部留白，避免內容被遮擋（當有飯店時顯示，即使只有一頁） -->
      <div v-if="!loading && totalElements > 0" class="h-20"></div>
      </div>
    </div>

      <!-- 回到頂部懸浮按鈕 -->
      <Button
        v-if="showScrollToTop"
        variant="default"
        class="fixed bottom-28 right-8 z-[60] h-auto px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        @click="scrollToTop"
        title="回到頂部"
      >
        <ArrowUp class="h-5 w-5" />
        <span class="font-semibold text-sm">TOP</span>
      </Button>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Trash2, MapPin, Phone, PhoneCall, Mail, Image, Bed, Building2, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Filter, X, LayoutGrid, List, ArrowUp, Download, FileText, Power, PowerOff, ListChecks, MoreVertical, UtensilsCrossed } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Layout from '@/user/layouts/OwnerLayout.vue'
import Button from '@/user/components/ui/Button.vue'
import Card from '@/user/components/ui/Card.vue'
import CardContent from '@/user/components/ui/CardContent.vue'
import CardHeader from '@/user/components/ui/CardHeader.vue'
import CardTitle from '@/user/components/ui/CardTitle.vue'
import CardDescription from '@/user/components/ui/CardDescription.vue'
import Badge from '@/user/components/ui/Badge.vue'
import Select from '@/user/components/ui/Select.vue'
import Label from '@/user/components/ui/Label.vue'
import { hotelAPI } from '@/user/api/hotel'
import { roomAPI } from '@/user/api/room'
import { facilityAPI } from '@/user/api/facility'
import { bedTypeAPI } from '@/user/api/room'
import { photoAPI } from '@/user/api/photo'
import { getAllDistricts } from '@/user/api/district'
import { hotelTypeAPI } from '@/user/api/hotelType'
// 已移除 auth 驗證
import { getCropPosition } from '@/user/utils/photoCrop'
import { calculateHotelProgress, getProgressColor } from '@/user/utils/hotelProgress'
// 導入電話圖標圖片
// 使用相對路徑和 new URL 確保在構建和開發環境中都能正確載入
const phoneIcon = new URL('../assets/images/phone-icon.png', import.meta.url).href

// 照片路徑
const path = import.meta.env.VITE_PHOTO_URL
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const router = useRouter()
const hotels = ref([])
const loading = ref(true)
const roomTypeCounts = ref({}) // 修改：存儲每個飯店的房型數量
const imageAspectRatios = ref({}) // 存儲每張圖片的寬高比，用於智能裁剪
const facilities = ref([]) // 存儲所有設施資料，用於檢查是否有早餐
const showExportMenu = ref(false) // 匯出選單顯示狀態
const showFilterPanel = ref(false) // 篩選面板顯示狀態
const showMobileMenu = ref(false) // 行動版選單顯示狀態
const hotelProgress = ref({}) // 存儲每個飯店的進度資訊
const expandedFacilities = ref({}) // 存儲每個飯店的設施展開狀態
const hotelRoomTypes = ref({}) // 存儲每個飯店的房型列表
const hotelPhotos = ref({}) // 存儲每個飯店的照片列表
const expandedRoomTypes = ref({}) // 存儲每個飯店的房型展開狀態
const bedTypes = ref([]) // 存儲所有床型資料，用於顯示床型名稱

// 回到頂部按鈕顯示狀態
const showScrollToTop = ref(false)

// 回到頂部
const scrollToTop = () => {
  const mainElement = document.querySelector('main')
  if (mainElement) {
    mainElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 分頁相關狀態
const currentPage = ref(1)
const pageSize = ref(3) // 每頁顯示 3 間飯店（默認值）
const totalPages = ref(0)
const totalElements = ref(0)

// 每頁顯示數量選項
const pageSizeOptions = [3, 6, 9, 12, 18, 24]

// 從 localStorage 讀取用戶選擇的每頁數量
const loadPageSize = () => {
  const saved = localStorage.getItem('hotel_page_size')
  if (saved) {
    const size = parseInt(saved)
    if (pageSizeOptions.includes(size)) {
      pageSize.value = size
    }
  }
}

// 保存每頁數量到 localStorage
const savePageSize = (size) => {
  localStorage.setItem('hotel_page_size', size.toString())
  pageSize.value = size
}

// 處理每頁數量變更
const handlePageSizeChange = (event) => {
  const newSize = parseInt(event.target.value)
  if (newSize !== pageSize.value) {
    savePageSize(newSize)
    currentPage.value = 1 // 重置到第一頁
    fetchHotels(1)
  }
}

// 排序相關狀態
const sortBy = ref(null) // 排序欄位：name, created_time, updated_time, location, business_status
const sortOrder = ref('desc') // 排序方向：asc, desc

// 排序選項
const sortOptions = [
  { value: null, label: '預設排序（建立時間）' },
  { value: 'name', label: '名稱' },
  { value: 'created_time', label: '建立時間' },
  { value: 'updated_time', label: '更新時間' },
  { value: 'location', label: '地區' },
  { value: 'business_status', label: '營業狀態' }
]

const sortOrderOptions = [
  { value: 'asc', label: '升序' },
  { value: 'desc', label: '降序' }
]

// 從 localStorage 讀取用戶選擇的排序
const loadSortSettings = () => {
  const savedSortBy = localStorage.getItem('hotel_sort_by')
  const savedSortOrder = localStorage.getItem('hotel_sort_order')
  if (savedSortBy && savedSortBy !== 'null') {
    const validSortFields = ['name', 'created_time', 'updated_time', 'location', 'business_status']
    if (validSortFields.includes(savedSortBy)) {
      sortBy.value = savedSortBy
    }
  }
  if (savedSortOrder && (savedSortOrder === 'asc' || savedSortOrder === 'desc')) {
    sortOrder.value = savedSortOrder
  }
}

// 保存排序設置到 localStorage
const saveSortSettings = (by, order) => {
  if (by !== null && by !== undefined) {
    localStorage.setItem('hotel_sort_by', by)
    sortBy.value = by
  } else {
    localStorage.removeItem('hotel_sort_by')
    sortBy.value = null
  }
  if (order) {
    localStorage.setItem('hotel_sort_order', order)
    sortOrder.value = order
  }
}

// 處理排序變更
const handleSortChange = (event) => {
  const newSortBy = event.target.value === 'null' || event.target.value === '' ? null : event.target.value
  saveSortSettings(newSortBy, sortOrder.value)
  currentPage.value = 1 // 重置到第一頁
  fetchHotels(1)
}

// 處理排序方向變更
const handleSortOrderChange = (event) => {
  const newSortOrder = event.target.value
  saveSortSettings(sortBy.value, newSortOrder)
  currentPage.value = 1 // 重置到第一頁
  fetchHotels(1)
}

// 佈局相關狀態
const layoutMode = ref('grid') // 'grid' 或 'list'

// 佈局選項
const layoutOptions = [
  { value: 'grid', label: '網格', icon: LayoutGrid },
  { value: 'list', label: '列表', icon: List }
]

// 從 localStorage 讀取用戶選擇的佈局
const loadLayoutMode = () => {
  const saved = localStorage.getItem('hotel_layout_mode')
  if (saved && (saved === 'grid' || saved === 'list')) {
    layoutMode.value = saved
  }
}

// 保存佈局設置到 localStorage
const saveLayoutMode = (mode) => {
  localStorage.setItem('hotel_layout_mode', mode)
  layoutMode.value = mode
}

// 處理佈局切換
const handleLayoutChange = (mode) => {
  saveLayoutMode(mode)
}

// 地區篩選狀態
const selectedCityId = ref(null)
const selectedDistrictId = ref(null)
const cities = ref([]) // 該房東擁有的飯店所在的所有城市
const districts = ref([]) // 選中城市下的行政區
const loadingCities = ref(false)

// 營業狀態和飯店類型篩選狀態
const selectedBusinessStatus = ref(null) // null=全部, true=營業中, false=停業中
const selectedHotelTypeId = ref(null)
const availableHotelTypes = ref([]) // 從現有飯店中提取的唯一飯店類型

// 計算當前激活的篩選數量
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedCityId.value) count++
  if (selectedDistrictId.value) count++
  if (selectedBusinessStatus.value !== null) count++
  if (selectedHotelTypeId.value) count++
  return count
})

// 計算是否有激活的篩選條件
const hasActiveFilters = computed(() => {
  return activeFilterCount.value > 0
})

// 已移除 auth 驗證
const userId = null // 不再需要用戶 ID 驗證

// 將事件處理函數移到 setup 頂層，確保可以在 onUnmounted 中正確引用
// 修改：當頁面重新獲得焦點時自動刷新數據
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 頁面重新可見時刷新當前頁數據
    fetchHotels(currentPage.value)
  }
}

// 監聽裁剪位置更新事件
const handleCropPositionUpdate = () => {
  // 觸發重新渲染以更新封面照片位置
  hotels.value = [...hotels.value]
}

// 滾動監聽處理
const handleScroll = () => {
  // 獲取主內容區域的滾動容器
  const mainElement = document.querySelector('main')
  if (mainElement) {
    // 只要不在最上面就顯示按鈕
    const scrollTop = mainElement.scrollTop
    showScrollToTop.value = scrollTop > 0
  } else {
    // 如果找不到 main，使用 window 的滾動位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    showScrollToTop.value = scrollTop > 0
  }
}

// 點擊外部關閉篩選面板
const handleClickOutside = (event) => {
  const filterButton = event.target.closest('[data-filter-button]')
  const filterPanel = event.target.closest('[data-filter-panel]')
  if (!filterButton && !filterPanel) {
    showFilterPanel.value = false
  }
}

onMounted(async () => {
  // 載入用戶選擇的每頁數量、排序設置和佈局模式
  loadPageSize()
  loadSortSettings()
  loadLayoutMode()
  // 載入所有設施資料（用於檢查是否有早餐）
  await loadFacilities()
  // 載入所有床型資料（用於顯示床型名稱）
  await loadBedTypes()
  await fetchHotels()
  await loadCitiesAndDistricts()
  
  // 監聽滾動事件
  const mainElement = document.querySelector('main')
  if (mainElement) {
    mainElement.addEventListener('scroll', handleScroll, { passive: true })
    // 初始檢查一次
    handleScroll()
  } else {
    console.warn('找不到 main 元素')
    // 如果找不到 main，也嘗試監聽 window 的滾動
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('photoCropPositionUpdated', handleCropPositionUpdate)
  document.addEventListener('click', handleClickOutside)
})

// 組件卸載時清理監聽器（移到 setup 頂層）
onUnmounted(() => {
  const mainEl = document.querySelector('main')
  if (mainEl) {
    mainEl.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('photoCropPositionUpdated', handleCropPositionUpdate)
  document.removeEventListener('click', handleClickOutside)
})

const fetchHotels = async (page = currentPage.value) => {
  try {
    loading.value = true
    // 修改：清空舊數據，確保顯示最新數據
    hotels.value = []
    roomTypeCounts.value = {}
    
    // 修改：使用分頁參數、篩選參數和排序參數調用 API
    const data = await hotelAPI.getHotelsByOwner({ 
      page, 
      size: pageSize.value,
      cityId: selectedCityId.value,
      districtId: selectedDistrictId.value,
      businessStatus: selectedBusinessStatus.value,
      hotelTypeId: selectedHotelTypeId.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    // 修改：處理分頁響應
    if (data.content) {
      // 分頁響應格式
      hotels.value = data.content || []
      currentPage.value = data.currentPage || page
      totalPages.value = data.totalPages || 0
      totalElements.value = data.totalElements || 0
    } else {
      // 兼容舊格式（無分頁）
      hotels.value = Array.isArray(data) ? data : []
      totalPages.value = 1
      totalElements.value = hotels.value.length
    }
    
    // 調試信息（僅在開發模式下輸出）
    if (import.meta.env.DEV) {
      console.log('獲取的飯店數據：', {
        page: currentPage.value,
        totalPages: totalPages.value,
        totalElements: totalElements.value,
        hotels: hotels.value.map(h => ({
          id: h.id,
          name: h.name,
          facilityIds: h.facilityIds,
          facilityCount: h.facilityIds?.length || 0,
          photos: h.photos?.length || 0
        }))
      })
    }
    
    // 修改：並行獲取所有飯店的房型數量
    if (hotels.value.length > 0) {
      await fetchRoomTypeCounts()
      await fetchHotelProgress()
    }
    
    // 提取可用的飯店類型（從所有飯店中）
    extractAvailableHotelTypes()
  } catch (error) {
    // 如果是 401 未授權錯誤，才顯示錯誤訊息
    // 其他錯誤（如網路問題）或空列表（新房東沒有飯店）不顯示錯誤
    if (error.message && error.message.includes('未授權')) {
      // 只在開發模式下顯示錯誤訊息
      if (import.meta.env.DEV) {
        console.error('載入飯店列表失敗：', error.message)
      }
    } else {
      // 其他錯誤（如網路問題、空列表等）靜默處理，不顯示錯誤
      if (import.meta.env.DEV) {
        console.warn('載入飯店列表時發生問題（可能是新房東沒有飯店）：', error.message)
      }
    }
    hotels.value = []
    roomTypeCounts.value = {}
    totalPages.value = 0
    totalElements.value = 0
  } finally {
    loading.value = false
  }
}

// 切換頁面
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value) {
    currentPage.value = newPage
    fetchHotels(newPage)
    // 修改：滾動到內容區域頂部（考慮左側邊欄）
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

// 計算要顯示的頁碼（顯示當前頁前後各2頁）
const getPageNumbers = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// 載入該房東擁有的飯店所在的所有城市和行政區
const loadCitiesAndDistricts = async () => {
  try {
    loadingCities.value = true
    
    // 方法1：嘗試從飯店列表提取城市和行政區信息（如果有飯店）
    let cityMap = new Map()
    let districtMap = new Map() // cityId -> districts
    let hotelList = [] // 在函數開始時初始化，確保在所有情況下都有值
    
    try {
      const allHotels = await hotelAPI.getHotelsByOwner({ page: 1, size: 1000 })
      hotelList = allHotels.content || allHotels || [] // 使用賦值而不是 const
      
      // 從飯店列表中提取城市和行政區
      hotelList.forEach(hotel => {
        if (hotel.district && hotel.district.city) {
          const city = hotel.district.city
          if (!cityMap.has(city.id)) {
            cityMap.set(city.id, {
              id: city.id,
              name: city.name
            })
            
            // 初始化該城市的行政區列表
            if (!districtMap.has(city.id)) {
              districtMap.set(city.id, new Map())
            }
          }
          
          // 添加行政區
          const district = hotel.district
          if (!districtMap.get(city.id).has(district.id)) {
            districtMap.get(city.id).set(district.id, {
              id: district.id,
              name: district.name
            })
          }
        }
      })
    } catch (error) {
      // 如果無法載入飯店列表（例如新房東沒有飯店或 401 錯誤），從 API 獲取所有城市和行政區
      if (import.meta.env.DEV) {
        console.log('無法從飯店列表提取城市信息，改為從 API 獲取所有城市和行政區')
      }
      
      try {
        // 從 API 獲取所有行政區（包含城市信息）
        const allDistricts = await getAllDistricts()
        
        if (allDistricts && Array.isArray(allDistricts)) {
          // 從行政區列表中提取城市和行政區
          allDistricts.forEach(district => {
            if (district.city) {
              const city = district.city
              if (!cityMap.has(city.id)) {
                cityMap.set(city.id, {
                  id: city.id,
                  name: city.name
                })
                
                // 初始化該城市的行政區列表
                if (!districtMap.has(city.id)) {
                  districtMap.set(city.id, new Map())
                }
              }
              
              // 添加行政區
              if (!districtMap.get(city.id).has(district.id)) {
                districtMap.get(city.id).set(district.id, {
                  id: district.id,
                  name: district.name
                })
              }
            }
          })
        }
      } catch (apiError) {
        // 如果 API 也失敗，使用空列表
        if (import.meta.env.DEV) {
          console.warn('無法從 API 獲取城市和行政區信息:', apiError)
        }
      }
    }

    // 轉換為數組並排序
    cities.value = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))

    // 如果已選擇城市，載入該城市的行政區
    if (selectedCityId.value) {
      loadDistrictsByCity(selectedCityId.value, districtMap)
    }
    
    // 從 API 獲取所有飯店類型（不依賴現有飯店）
    await loadHotelTypes()
    
    // 如果 hotelList 存在且有內容，也可以從中提取（作為補充）
    if (hotelList && hotelList.length > 0) {
      extractAvailableHotelTypesFromList(hotelList)
    }
  } catch (error) {
    console.error('載入城市列表失敗：', error)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

// 從飯店列表中提取可用的飯店類型（合併到現有列表中，不覆蓋）
const extractAvailableHotelTypesFromList = (hotelList) => {
  const typeMap = new Map()
  
  // 先將現有的類型加入 Map
  availableHotelTypes.value.forEach(type => {
    typeMap.set(type.id, type)
  })
  
  // 從飯店列表中提取類型並合併
  hotelList.forEach(hotel => {
    if (hotel.hotelType && hotel.hotelType.id) {
      if (!typeMap.has(hotel.hotelType.id)) {
        typeMap.set(hotel.hotelType.id, {
          id: hotel.hotelType.id,
          type: hotel.hotelType.type
        })
      }
    }
  })
  
  // 更新列表並排序
  availableHotelTypes.value = Array.from(typeMap.values()).sort((a, b) => {
    const labelA = getHotelTypeLabel(a)
    const labelB = getHotelTypeLabel(b)
    return labelA.localeCompare(labelB, 'zh-TW')
  })
}

// 從 API 載入所有飯店類型
const loadHotelTypes = async () => {
  try {
    const types = await hotelTypeAPI.getAllHotelTypes()
    if (Array.isArray(types) && types.length > 0) {
      // 轉換為統一的格式
      availableHotelTypes.value = types.map(type => ({
        id: type.id,
        type: type.type
      })).sort((a, b) => {
        const labelA = getHotelTypeLabel(a)
        const labelB = getHotelTypeLabel(b)
        return labelA.localeCompare(labelB, 'zh-TW')
      })
    }
  } catch (error) {
    console.error('載入飯店類型失敗：', error)
    // 如果 API 失敗，嘗試從現有飯店中提取
    try {
      const allHotels = await hotelAPI.getHotelsByOwner({ page: 1, size: 1000 })
      const hotelList = allHotels.content || allHotels || []
      extractAvailableHotelTypesFromList(hotelList)
    } catch (fallbackError) {
      console.error('從飯店列表提取類型也失敗：', fallbackError)
    }
  }
}

// 從當前顯示的飯店中提取可用的飯店類型（用於動態更新，作為補充）
const extractAvailableHotelTypes = async () => {
  try {
    // 獲取所有飯店（不分頁）來提取飯店類型
    const allHotels = await hotelAPI.getHotelsByOwner({ page: 1, size: 1000 })
    const hotelList = allHotels.content || allHotels || []
    extractAvailableHotelTypesFromList(hotelList)
  } catch (error) {
    console.error('提取飯店類型失敗：', error)
  }
}

// 根據城市載入行政區
const loadDistrictsByCity = (cityId, districtMap = null) => {
  if (!cityId) {
    districts.value = []
    return
  }

  // 如果沒有傳入 districtMap，需要重新載入
  if (!districtMap) {
    loadCitiesAndDistricts()
    return
  }

  const cityDistricts = districtMap.get(cityId)
  if (cityDistricts) {
    districts.value = Array.from(cityDistricts.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'zh-TW')
    )
  } else {
    districts.value = []
  }

  // 如果當前選擇的行政區不屬於新選擇的城市，清除行政區選擇
  if (selectedDistrictId.value && districts.value.length > 0) {
    const hasDistrict = districts.value.some(d => d.id === selectedDistrictId.value)
    if (!hasDistrict) {
      selectedDistrictId.value = null
    }
  }
}

// 處理城市變更
const handleCityChange = async (event) => {
  // 阻止事件冒泡，防止觸發其他點擊事件
  if (event) {
    event.stopPropagation()
  }
  
  const cityId = event.target.value ? parseInt(event.target.value) : null
  selectedCityId.value = cityId
  selectedDistrictId.value = null // 清除行政區選擇

  // 載入該城市的行政區
  if (cityId) {
    await loadCitiesAndDistricts()
    const cityDistricts = districts.value.filter(d => {
      // 從已載入的飯店中找出該城市的行政區
      return hotels.value.some(h => 
        h.district && h.district.city && h.district.city.id === cityId && h.district.id === d.id
      )
    })
    // 重新載入以獲取完整的行政區列表
    await loadCitiesAndDistricts()
  } else {
    districts.value = []
  }

  // 重置到第一頁並重新載入飯店
  currentPage.value = 1
  await fetchHotels(1)
}

// 處理行政區變更
const handleDistrictChange = (event) => {
  // 阻止事件冒泡，防止觸發其他點擊事件
  if (event) {
    event.stopPropagation()
  }
  
  const districtId = event.target.value ? parseInt(event.target.value) : null
  selectedDistrictId.value = districtId

  // 重置到第一頁並重新載入飯店
  currentPage.value = 1
  fetchHotels(1)
}

// 處理營業狀態篩選變更
const handleBusinessStatusChange = (event) => {
  // 阻止事件冒泡，防止觸發其他點擊事件
  if (event) {
    event.stopPropagation()
  }
  
  const value = event.target.value
  selectedBusinessStatus.value = value === '' ? null : (value === 'true')
  
  // 重置到第一頁並重新載入飯店
  currentPage.value = 1
  fetchHotels(1)
}

// 處理飯店類型篩選變更
const handleHotelTypeChange = (event) => {
  // 阻止事件冒泡，防止觸發其他點擊事件（如新增飯店按鈕）
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  const hotelTypeId = event.target.value ? parseInt(event.target.value) : null
  selectedHotelTypeId.value = hotelTypeId

  // 重置到第一頁並重新載入飯店
  currentPage.value = 1
  fetchHotels(1)
}

/**
 * 載入所有設施資料（用於檢查是否有早餐）
 */
const loadFacilities = async () => {
  try {
    facilities.value = await facilityAPI.getAllFacilities()
  } catch (error) {
    console.error('載入設施資料失敗:', error)
    facilities.value = []
  }
}

/**
 * 載入所有床型資料（用於顯示床型名稱）
 */
const loadBedTypes = async () => {
  try {
    bedTypes.value = await bedTypeAPI.getAllBedTypes()
  } catch (error) {
    console.error('載入床型資料失敗:', error)
    bedTypes.value = []
  }
}

/**
 * 獲取飯店的設施 ID 列表
 * @param {Object} hotel - 飯店對象
 * @returns {Array} 設施 ID 數組
 */
const getHotelFacilities = (hotel) => {
  return hotel.facilityIds || []
}

/**
 * 根據設施 ID 獲取設施名稱
 * @param {number} facilityId - 設施 ID
 * @returns {string} 設施名稱
 */
const getFacilityName = (facilityId) => {
  if (!facilities.value || facilities.value.length === 0) {
    return ''
  }
  const facility = facilities.value.find(f => f.id === facilityId)
  return facility?.name || ''
}

/**
 * 獲取要顯示的設施列表（根據展開狀態）
 * @param {Object} hotel - 飯店對象
 * @returns {Array} 要顯示的設施 ID 數組
 */
const getDisplayedFacilities = (hotel) => {
  const allFacilities = getHotelFacilities(hotel)
  if (isFacilitiesExpanded(hotel.id)) {
    return allFacilities // 展開時顯示所有設施
  }
  return allFacilities.slice(0, 6) // 收起時只顯示前 6 個
}

/**
 * 檢查設施列表是否已展開
 * @param {number} hotelId - 飯店 ID
 * @returns {boolean} 是否已展開
 */
const isFacilitiesExpanded = (hotelId) => {
  return expandedFacilities.value[hotelId] === true
}

/**
 * 切換設施列表的展開/收起狀態
 * @param {number} hotelId - 飯店 ID
 */
const toggleFacilitiesExpand = (hotelId) => {
  expandedFacilities.value[hotelId] = !expandedFacilities.value[hotelId]
}

/**
 * 檢查飯店是否有早餐設施
 * @param {Object} hotel - 飯店對象
 * @returns {boolean} 是否有早餐
 */
const hasBreakfast = (hotel) => {
  if (!hotel.facilityIds || !facilities.value || facilities.value.length === 0) {
    return false
  }
  
  // 早餐相關的關鍵字
  const breakfastKeywords = ['早餐', '附早餐', '提供早餐', '免費早餐', '自助早餐', '早餐服務']
  
  // 檢查飯店的設施 ID 列表中是否有早餐相關的設施
  return hotel.facilityIds.some(facilityId => {
    const facility = facilities.value.find(f => f.id === facilityId)
    if (!facility || !facility.name) {
      return false
    }
    // 檢查設施名稱是否包含早餐相關關鍵字
    return breakfastKeywords.some(keyword => facility.name.includes(keyword))
  })
}

// 清除篩選
const clearFilters = () => {
  selectedCityId.value = null
  selectedDistrictId.value = null
  selectedBusinessStatus.value = null
  selectedHotelTypeId.value = null
  districts.value = []
  currentPage.value = 1
  fetchHotels(1)
}

// 修改：獲取所有飯店的房型數量
// 獲取飯店進度資訊
const fetchHotelProgress = async () => {
  const progressPromises = hotels.value.map(async (hotel) => {
    try {
      // 並行獲取房型和照片
      const [roomTypes, photos] = await Promise.all([
        roomAPI.getRoomsByHotelIdForOwner(hotel.id).catch(() => []),
        photoAPI.getPhotosByHotelId(hotel.id).catch(() => [])
      ])

      // 計算進度（暫時不檢查付款設定，因為還沒有 API）
      const progress = calculateHotelProgress(
        hotel,
        Array.isArray(roomTypes) ? roomTypes : [],
        Array.isArray(photos) ? photos : [],
        {} // 付款設定暫時為空
      )

      return { hotelId: hotel.id, progress }
    } catch (error) {
      console.error(`獲取飯店 ${hotel.id} 進度失敗：`, error)
      // 如果獲取失敗，使用基本資訊計算進度
      const progress = calculateHotelProgress(hotel, [], [], {})
      return { hotelId: hotel.id, progress }
    }
  })

  const results = await Promise.all(progressPromises)
  results.forEach(({ hotelId, progress }) => {
    hotelProgress.value[hotelId] = progress
  })
}

// 獲取飯店進度
const getHotelProgress = (hotelId) => {
  return hotelProgress.value[hotelId] || { percentage: 0, pendingSteps: [], canOpenBusiness: false }
}

const fetchRoomTypeCounts = async () => {
  try {
    // 並行請求所有飯店的房型列表
    const promises = hotels.value.map(async (hotel) => {
      try {
        // 使用後台專用API，可以查看停業飯店的房型
        const rooms = await roomAPI.getRoomsByHotelIdForOwner(hotel.id)
        // 同時存儲房型列表
        hotelRoomTypes.value[hotel.id] = Array.isArray(rooms) ? rooms : []
        return { hotelId: hotel.id, count: rooms?.length || 0 }
      } catch (error) {
        console.error(`獲取飯店 ${hotel.id} 的房型數量失敗：`, error)
        hotelRoomTypes.value[hotel.id] = []
        return { hotelId: hotel.id, count: 0 }
      }
    })
    
    const results = await Promise.all(promises)
    
    // 將結果存儲到 roomTypeCounts 對象中
    results.forEach(({ hotelId, count }) => {
      roomTypeCounts.value[hotelId] = count
    })
  } catch (error) {
    console.error('獲取房型數量失敗：', error)
  }
}

// 修改：獲取飯店的房型數量
const getRoomTypeCount = (hotelId) => {
  return roomTypeCounts.value[hotelId] ?? 0
}

/**
 * 獲取飯店的房型列表
 * @param {number} hotelId - 飯店 ID
 * @returns {Array} 房型列表
 */
const getHotelRoomTypes = (hotelId) => {
  return hotelRoomTypes.value[hotelId] || []
}

/**
 * 根據床型 ID 獲取床型名稱
 * @param {number} bedTypeId - 床型 ID
 * @returns {string} 床型名稱
 */
const getBedTypeName = (bedTypeId) => {
  if (!bedTypes.value || bedTypes.value.length === 0 || !bedTypeId) {
    return '床'
  }
  const bedType = bedTypes.value.find(b => b.id === bedTypeId)
  return bedType?.name || '床'
}

/**
 * 獲取房型的床型資訊文字
 * @param {Object} roomType - 房型對象
 * @returns {string} 床型資訊文字
 */
const getRoomTypeBedTypesText = (roomType) => {
  // RoomDTO 結構：使用 bedTypeId 和 bedNumber（或 bedNumber）
  if (!roomType.bedTypeId) {
    return '無床型資訊'
  }
  
  const bedName = getBedTypeName(roomType.bedTypeId)
  const quantity = roomType.bedNumber || 1
  
  return `${bedName} x${quantity}`
}

/**
 * 獲取要顯示的房型列表（根據展開狀態）
 * @param {number} hotelId - 飯店 ID
 * @returns {Array} 要顯示的房型列表
 */
const getDisplayedRoomTypes = (hotelId) => {
  const allRoomTypes = getHotelRoomTypes(hotelId)
  if (isRoomTypesExpanded(hotelId)) {
    return allRoomTypes // 展開時顯示所有房型
  }
  return allRoomTypes.slice(0, 3) // 收起時只顯示前 3 個
}

/**
 * 檢查房型列表是否已展開
 * @param {number} hotelId - 飯店 ID
 * @returns {boolean} 是否已展開
 */
const isRoomTypesExpanded = (hotelId) => {
  return expandedRoomTypes.value[hotelId] === true
}

/**
 * 切換房型列表的展開/收起狀態
 * @param {number} hotelId - 飯店 ID
 */
const toggleRoomTypesExpand = (hotelId) => {
  expandedRoomTypes.value[hotelId] = !expandedRoomTypes.value[hotelId]
}

// 處理停業/營業切換（軟刪除）
const handleToggleBusinessStatus = async (hotel) => {
  const newStatus = !(hotel.businessStatus === true || hotel.businessStatus === 1)
  const action = newStatus ? '開啟營業' : '停業'
  
  // 如果嘗試開啟營業狀態，檢查必填資料是否完成
  if (newStatus) {
    const progress = getHotelProgress(hotel.id)
    if (progress && progress.percentage < 100) {
      // 提取步驟名稱（pendingSteps 是物件陣列，包含 name 和 key 屬性）
      const missingSteps = progress.pendingSteps
        .map(step => step.name || step.key || '未知步驟')
        .join('、')
      toast.error(`無法開啟營業狀態：請先完成所有必填項目\n\n待完成項目：${missingSteps}`)
      return
    }
  }
  
  if (!confirm(`確定要${action}此飯店嗎？${!newStatus ? '\n\n（停業後飯店將不會在前台顯示，但資料會保留）' : ''}`)) return

  try {
    // 統一使用 updateHotel API 來切換營業狀態（軟刪除）
    await hotelAPI.updateHotel(hotel.id, {
      businessStatus: newStatus
    })
    toast.success(`飯店已${action}`)
    fetchHotels()
  } catch (error) {
    // 如果後端也驗證失敗，顯示錯誤訊息
    if (error.message && error.message.includes('無法開啟營業狀態')) {
      toast.error(error.message)
    } else {
      toast.error(`${action}失敗：` + error.message)
    }
    console.error(`${action}失敗：`, error)
  }
}

const getHotelTypeLabel = (hotelType) => {
  if (!hotelType) return '未知'
  // 如果 hotelType 是對象，取 type 屬性；如果是字符串，直接返回
  const type = typeof hotelType === 'object' ? hotelType.type : hotelType
  const labels = {
    hotel: '飯店',
    bnb: '民宿',
    hostel: '青年旅館',
    resort: '度假村',
    apartment: '公寓',
  }
  return labels[type] || type
}

const navigate = (path) => {
  router.push(path)
}

// 處理繼續註冊
const handleContinueRegistration = (hotelId, stepKey) => {
  const stepRoutes = {
    basicInfo: `/hotels/${hotelId}`,
    rooms: `/hotels/${hotelId}/room-types`,
    photos: `/hotels/${hotelId}/images`,
    settings: `/hotels/${hotelId}/setup`
  }
  const route = stepRoutes[stepKey] || `/hotels/${hotelId}/setup`
  navigate(route)
}

// 生成篩選條件文字（用於匯出功能）
const getFilterConditionsText = () => {
  const filterConditions = []
  
  // 地區篩選
  if (selectedCityId.value) {
    const city = cities.value.find(c => c.id === selectedCityId.value)
    if (city) {
      let locationText = city.name
      if (selectedDistrictId.value) {
        const district = districts.value.find(d => d.id === selectedDistrictId.value)
        if (district) {
          locationText += ` - ${district.name}`
        }
      }
      filterConditions.push(`地區：${locationText}`)
    }
  }
  
  // 營業狀態篩選
  if (selectedBusinessStatus.value !== null) {
    const statusText = selectedBusinessStatus.value ? '營業中' : '停業中'
    filterConditions.push(`營業狀態：${statusText}`)
  }
  
  // 飯店類型篩選
  if (selectedHotelTypeId.value) {
    const hotelType = availableHotelTypes.value.find(t => t.id === selectedHotelTypeId.value)
    if (hotelType) {
      const typeLabel = getHotelTypeLabel(hotelType)
      filterConditions.push(`飯店類型：${typeLabel}`)
    }
  }
  
  return filterConditions.length > 0 ? filterConditions.join(' | ') : null
}

// 匯出為 PDF（使用 html2canvas 避免中文亂碼）
const exportToPDF = async () => {
  try {
    showExportMenu.value = false
    toast.info('正在生成 PDF...')
    
    // 創建一個臨時的表格元素用於匯出
    const tableContainer = document.createElement('div')
    tableContainer.style.position = 'absolute'
    tableContainer.style.left = '-9999px'
    tableContainer.style.width = '800px'
    tableContainer.style.backgroundColor = '#ffffff'
    tableContainer.style.padding = '20px'
    tableContainer.style.fontFamily = 'Arial, "Microsoft JhengHei", sans-serif'
    
    // 創建表格 HTML
    let tableHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #16a34a;">飯店列表</h1>
        <p style="font-size: 12px; color: #15803d;">生成時間：${new Date().toLocaleString('zh-TW')}</p>
    `
    
    // 篩選條件（顯示所有實際選擇的篩選）
    const filterText = getFilterConditionsText()
    if (filterText) {
      tableHTML += `<p style="font-size: 12px; color: #15803d; text-align: left; margin-bottom: 15px;">篩選條件：${filterText}</p>`
    }
    
    tableHTML += `
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #16a34a; color: white;">
            <th style="padding: 10px; border: 1px solid #15803d; text-align: left;">ID</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: left;">飯店名稱</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: left;">地區</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: left;">狀態</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: center;">房型</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: center;">設施</th>
            <th style="padding: 10px; border: 1px solid #15803d; text-align: center;">照片</th>
          </tr>
        </thead>
        <tbody>
    `
    
    hotels.value.forEach((hotel, index) => {
      let location = '未設定'
      if (hotel.district) {
        const cityName = hotel.district.city?.name || ''
        const districtName = hotel.district.name || ''
        location = cityName && districtName ? `${cityName}${districtName}` : (cityName || districtName || '未設定')
      }
      
      // 使用淡綠色作為交替行背景色
      const bgColor = index % 2 === 0 ? '#f0fdf4' : '#ffffff'
      tableHTML += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 8px; border: 1px solid #dcfce7;">${hotel.id || ''}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7;">${hotel.name || ''}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7;">${location}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7;">${hotel.businessStatus ? '營業中' : '停業中'}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7; text-align: center;">${getRoomTypeCount(hotel.id) || 0}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7; text-align: center;">${hotel.facilityIds?.length || 0}</td>
          <td style="padding: 8px; border: 1px solid #dcfce7; text-align: center;">${hotel.photos?.length || 0}</td>
        </tr>
      `
    })
    
    tableHTML += `
        </tbody>
      </table>
    `
    
    tableContainer.innerHTML = tableHTML
    document.body.appendChild(tableContainer)
    
    // 使用 html2canvas 轉換為圖片
    const canvas = await html2canvas(tableContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    // 移除臨時元素
    document.body.removeChild(tableContainer)
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4 寬度 (mm)
    const pageHeight = 297 // A4 高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // 添加第一頁
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果內容超過一頁，添加更多頁
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 生成檔名並下載
    const fileName = `飯店列表_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    toast.success('PDF 匯出成功！')
  } catch (err) {
    console.error('匯出 PDF 失敗：', err)
    toast.error('匯出 PDF 失敗：' + err.message)
  }
}


// 匯出為 CSV
const exportToCSV = () => {
  try {
    showExportMenu.value = false
    toast.info('正在生成 CSV...')

    // 準備 CSV 數據
    const csvRows = []
    
    // 添加標題和篩選條件
    csvRows.push(['飯店列表'])
    csvRows.push(['生成時間', new Date().toLocaleString('zh-TW')])
    
    // 添加篩選條件（如果有）
    const filterText = getFilterConditionsText()
    if (filterText) {
      csvRows.push(['篩選條件', filterText])
    }
    
    // 空行
    csvRows.push([])
    
    // 標題行
    csvRows.push(['飯店ID', '飯店名稱', '地區', '地址', '電話', '市話', '營業狀態', '房型數', '設施數', '照片數', '建立時間', '更新時間'].join(','))
    
    // 數據行
    hotels.value.forEach(hotel => {
      let location = '未設定'
      if (hotel.district) {
        const cityName = hotel.district.city?.name || ''
        const districtName = hotel.district.name || ''
        location = cityName && districtName ? `${cityName}${districtName}` : (cityName || districtName || '未設定')
      }

      const row = [
        hotel.id || '',
        `"${(hotel.name || '').replace(/"/g, '""')}"`,
        `"${location.replace(/"/g, '""')}"`,
        `"${(hotel.address || '').replace(/"/g, '""')}"`,
        `"${formatPhone(hotel.phone) || ''}"`,
        `"${formatLocalCall(hotel.localCall) || ''}"`,
        hotel.businessStatus ? '營業中' : '停業中',
        getRoomTypeCount(hotel.id) || 0,
        hotel.facilityIds?.length || 0,
        hotel.photos?.length || 0,
        hotel.createdTime || '',
        hotel.updatedTime || ''
      ]
      csvRows.push(row.join(','))
    })

    // 創建 Blob 並下載
    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // 添加 BOM 以支援中文
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `飯店列表_${dateStr}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV 匯出成功！')
  } catch (err) {
    console.error('匯出 CSV 失敗：', err)
    toast.error('匯出 CSV 失敗：' + err.message)
  }
}

/**
 * 獲取飯店的封面照片
 * @param {Object} hotel - 飯店對象
 * @returns {Object|null} 封面照片對象，如果沒有則返回 null
 */
const getCoverPhoto = (hotel) => {
  if (!hotel.photos || hotel.photos.length === 0) {
    return null
  }
  
  // 查找 isCover 為 true 的照片
  const coverPhoto = hotel.photos.find(photo => photo.isCover === true || photo.isCover === 1)
  
  // 如果沒有找到封面照片，返回第一張照片
  return coverPhoto || hotel.photos[0] || null
}

/**
<<<<<<< HEAD
 * 將相對路徑轉換為完整 URL 用於顯示
 * @param {string} url - 照片 URL（相對路徑或完整 URL）
 * @returns {string} 完整 URL
 */
const getImageUrl = (url) => {
  if (!url) {
    console.warn('getImageUrl: url 為空')
    return ''
  }
  
  // 如果已經是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 修改：處理絕對路徑（如 /Desktop/FINAL1117/ho-back/room_images/11.jpg）
  // 提取出相對路徑部分（如 /room_images/11.jpg）
  let normalizedUrl = url
  
  // 如果包含 room_images，提取相對路徑
  if (url.includes('room_images')) {
    const roomImagesIndex = url.indexOf('room_images')
    normalizedUrl = '/' + url.substring(roomImagesIndex)
  }
  // 如果包含 uploads，提取相對路徑
  else if (url.includes('uploads')) {
    const uploadsIndex = url.indexOf('uploads')
    normalizedUrl = '/' + url.substring(uploadsIndex)
  }
  // 如果已經是相對路徑（以 / 開頭且不包含絕對路徑特徵），直接使用
  else if (url.startsWith('/') && !url.includes('Desktop') && !url.includes('FINAL')) {
    normalizedUrl = url
  }
  // 其他情況，確保以 / 開頭
  else {
    normalizedUrl = url.startsWith('/') ? url : '/' + url
  }
  
  // 轉換為完整 URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.25.152:8080/api'
  const baseUrl = API_BASE_URL.replace('/api', '')
  const fullUrl = `${baseUrl}${normalizedUrl}`
  
  // 調試：輸出構建的 URL
  // 調試信息（僅在開發模式下輸出）
  if (import.meta.env.DEV) {
    console.log('getImageUrl:', { original: url, normalized: normalizedUrl, fullUrl })
  }
  
  return fullUrl
}

/**
=======
>>>>>>> a1dafafb0b88643d00499107fb28a4f14565c9bd
 * 獲取圖片的 CSS 類名
 * @param {Object} hotel - 飯店對象
 * @returns {string} CSS 類名
 */
const getImageClass = (hotel) => {
  const photo = getCoverPhoto(hotel)
  if (!photo) return ''
  
  const imageKey = `${hotel.id}-${photo.id}`
  const aspectRatio = imageAspectRatios.value[imageKey]
  
  // 基礎樣式
  let classes = 'h-full w-full object-cover transition-transform hover:scale-105'
  
  return classes
}

/**
 * 獲取圖片的樣式對象（用於智能裁剪）
 * @param {Object} hotel - 飯店對象
 * @returns {Object} 樣式對象
 */
const getImageStyle = (hotel) => {
  const photo = getCoverPhoto(hotel)
  if (!photo) return {}
  
  // 優先使用用戶設定的裁剪位置（從 localStorage 讀取）
  const userCropPosition = getCropPosition(photo.id)
  if (userCropPosition && userCropPosition !== 'center center') {
    return {
      objectPosition: userCropPosition
    }
  }
  
  // 如果沒有設定，使用智能裁剪策略
  const imageKey = `${hotel.id}-${photo.id}`
  const aspectRatio = imageAspectRatios.value[imageKey]
  
  // 容器寬高比是 16:9 ≈ 1.78
  const containerAspectRatio = 16 / 9
  
  // 如果沒有載入過圖片，使用默認的居中裁剪
  if (!aspectRatio) {
    return {
      objectPosition: 'center center'
    }
  }
  
  // 智能裁剪策略：
  // 1. 如果圖片是橫向的（寬 > 高），從中心裁剪
  // 2. 如果圖片是縱向的（高 > 寬），從頂部中心裁剪（保留上方重要內容）
  // 3. 如果圖片比例接近容器，從中心裁剪
  
  if (aspectRatio > containerAspectRatio) {
    // 圖片比容器更寬（橫向），從中心裁剪
    return {
      objectPosition: 'center center'
    }
  } else if (aspectRatio < 1) {
    // 圖片是縱向的（高 > 寬），從頂部中心裁剪
    return {
      objectPosition: 'center top'
    }
  } else {
    // 圖片比例接近容器，從中心裁剪
    return {
      objectPosition: 'center center'
    }
  }
}

/**
 * 處理圖片載入完成事件
 * @param {Event} event - 載入事件
 * @param {Object} hotel - 飯店對象
 */
const handleImageLoad = (event, hotel) => {
  const img = event.target
  const photo = getCoverPhoto(hotel)
  if (!photo) return
  
  // 計算圖片的寬高比
  const aspectRatio = img.naturalWidth / img.naturalHeight
  const imageKey = `${hotel.id}-${photo.id}`
  
  // 存儲寬高比，用於智能裁剪
  imageAspectRatios.value[imageKey] = aspectRatio
}

/**
 * 處理圖片載入錯誤
 * @param {Event} event - 錯誤事件
 */
const handleImageError = (event) => {
  // 當圖片載入失敗時，顯示錯誤信息
  const img = event.target
  console.error('圖片載入失敗:', {
    src: img.src,
    alt: img.alt,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight
  })
  
  // 顯示錯誤占位符（可選）
  // img.src = '/placeholder-image.jpg'
  // 或者隱藏圖片
  img.style.display = 'none'
}

/**
 * 格式化手機號碼為 "09XX - XXX - XXX" 格式
 * @param {string} phone - 原始手機號碼
 * @returns {string} 格式化後的手機號碼
 */
const formatPhone = (phone) => {
  if (!phone) return ''
  
  // 移除所有非數字字符
  const digits = phone.replace(/\D/g, '')
  
  // 台灣手機號碼通常是 10 位數字（09XX-XXX-XXX），格式化為 "09XX - XXX - XXX"
  if (digits.length === 10) {
    const prefix = digits.substring(0, 4)  // 09XX
    const middle = digits.substring(4, 7)  // XXX
    const last = digits.substring(7)         // XXX
    return `${prefix} - ${middle} - ${last}`
  }
  
  // 如果是 9 位數字，格式化為 "09X - XXX - XXX"
  if (digits.length === 9) {
    const prefix = digits.substring(0, 3)  // 09X
    const middle = digits.substring(3, 6)  // XXX
    const last = digits.substring(6)       // XXX
    return `${prefix} - ${middle} - ${last}`
  }
  
  // 其他情況，如果已經包含 "-"，保持原樣
  if (phone.includes('-')) {
    return phone
  }
  
  // 如果長度不符合常見格式，返回原值
  return phone
}

/**
 * 格式化市話號碼為 "02 - 1234 - 5678" 格式（三段式，與手機格式一致）
 * @param {string} localCall - 原始市話號碼
 * @returns {string} 格式化後的市話號碼
 */
const formatLocalCall = (localCall) => {
  if (!localCall) return ''
  
  // 移除所有非數字字符
  const digits = localCall.replace(/\D/g, '')
  
  // 如果是 10 位數字（2位區碼 + 8位號碼），格式化為 "02 - 1234 - 5678"
  if (digits.length === 10) {
    const areaCode = digits.substring(0, 2)      // 02
    const middle = digits.substring(2, 6)        // 1234
    const last = digits.substring(6)             // 5678
    return `${areaCode} - ${middle} - ${last}`
  }
  
  // 如果是 9 位數字（2位區碼 + 7位號碼），格式化為 "02 - 1234 - 567"
  if (digits.length === 9) {
    const areaCode = digits.substring(0, 2)      // 02
    const middle = digits.substring(2, 5)        // 123
    const last = digits.substring(5)           // 4567
    return `${areaCode} - ${middle} - ${last}`
  }
  
  // 如果是 11 位數字（3位區碼 + 8位號碼），格式化為 "022 - 1234 - 5678"
  if (digits.length === 11) {
    const areaCode = digits.substring(0, 3)      // 022
    const middle = digits.substring(3, 7)      // 1234
    const last = digits.substring(7)            // 5678
    return `${areaCode} - ${middle} - ${last}`
  }
  
  // 其他情況，如果已經包含 "-"，保持原樣
  if (localCall.includes('-')) {
    return localCall
  }
  
  // 如果長度不符合常見格式，返回原值
  return localCall
}

/**
 * 處理電話圖標載入錯誤
 * @param {Event} event - 錯誤事件
 */
const handlePhoneIconError = (event) => {
  const img = event.target
  console.warn('電話圖標載入失敗，請確認圖片文件已放置在 src/assets/images/phone-icon.png')
  // 隱藏圖片或使用備用 SVG（可選）
  img.style.display = 'none'
}
</script>

<style scoped>
/* 將電話圖標調整為與手機圖標相同的顏色（muted-foreground） */
/* 目標顏色：hsl(120 10% 45%) - 與 Phone 圖標的 text-muted-foreground 一致 */
.phone-icon-muted {
  /* 使用 filter 將圖片調整為 muted-foreground 顏色 */
  /* 方法：先將圖片變黑，然後調整為灰綠色調 */
  filter: 
    brightness(0) 
    saturate(100%) 
    invert(45%) 
    sepia(8%) 
    saturate(200%) 
    hue-rotate(120deg) 
    brightness(0.95) 
    contrast(0.9);
  /* 在淺色模式下使用 muted-foreground 顏色 */
}

.dark .phone-icon-muted {
  /* 深色模式下的 muted-foreground：hsl(120 10% 60%) */
  filter: 
    brightness(0) 
    saturate(100%) 
    invert(60%) 
    sepia(8%) 
    saturate(200%) 
    hue-rotate(120deg) 
    brightness(1.05) 
    contrast(0.9);
}
</style>

