# 📅 PHÂN TÍCH CHI TIẾT - AUTOMATION_BY_DATE.PY

## 🎯 Mục đích file

File `automation_by_date.py` là hệ thống automation chuyên biệt để lấy đơn hàng theo **khoảng thời gian tùy chỉnh** từ hệ thống ONE.

## 📊 Thông số kỹ thuật

- **Kích thước**: 490 dòng code
- **Class chính**: `ONEDateAutomation`
- **Dependencies**: selenium, pandas, requests
- **Output**: CSV files + Summary reports

---

## 🔄 QUY TRÌNH HOẠT ĐỘNG CHI TIẾT

### 🚀 **BƯỚC 1: KHỞI TẠO HỆ THỐNG**

```python
def __init__(self, config_path="config/config.json"):
    self.setup_logging()           # Setup logging system
    self.load_config(config_path)  # Load configuration
    self.driver = None             # Initialize driver as None
    self.session = requests.Session()
```

**Chi tiết:**

- ✅ Tạo thư mục `logs/` nếu chưa có
- ✅ Setup logging với file `logs/automation_by_date.log`
- ✅ Load config từ `config/config.json`
- ✅ Khởi tạo session cho requests

**Output:** System sẵn sàng với logging và config

---

### 🌐 **BƯỚC 2: SETUP WEBDRIVER**

```python
def setup_driver(self, headless=True):
    chrome_options = Options()

    # Performance optimizations
    if headless:
        chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
```

**Chi tiết tối ưu:**

- 🚀 **Headless mode**: Chạy ngầm không hiển thị browser
- 🚀 **Anti-detection**: Ẩn dấu hiệu automation
- 🚀 **Performance flags**: Tắt plugins, extensions không cần thiết
- 🚀 **Custom User-Agent**: Giả lập browser thật

**Output:** ChromeDriver sẵn sàng với performance tối ưu

---

### 🔐 **BƯỚC 3: ĐĂNG NHẬP VÀO HỆ THỐNG**

```python
def login(self):
    # Get credentials từ config hoặc environment
    username = self.config['credentials']['username']
    password = self.config['credentials']['password']

    # Load login page
    login_url = f"{self.config['system']['one_url']}/login"
    self.driver.get(login_url)

    # Check if already logged in
    if "so/index" in self.driver.current_url:
        return True  # Skip login

    # Enter credentials và submit
```

**Chi tiết xử lý:**

- ✅ **Smart login check**: Kiểm tra đã đăng nhập chưa
- ✅ **Environment variables**: Hỗ trợ `${ONE_USERNAME}`, `${ONE_PASSWORD}`
- ✅ **Wait strategies**: WebDriverWait với timeout 10s
- ✅ **Error handling**: Try-catch comprehensive

**Output:** Đăng nhập thành công vào hệ thống ONE

---

### 📋 **BƯỚC 4: ĐIỀU HƯỚNG ĐẾN TRANG ĐƠN HÀNG**

```python
def navigate_to_orders_page(self):
    orders_url = f"{self.config['system']['one_url']}/so/index"
    self.driver.get(orders_url)

    # Wait for date range button to appear
    WebDriverWait(self.driver, 10).until(
        EC.presence_of_element_located((By.ID, "daterange-btn"))
    )
```

**Chi tiết:**

- 🎯 **Direct URL**: Truy cập trực tiếp `/so/index`
- ⏳ **Wait strategy**: Chờ element `daterange-btn` xuất hiện
- 🔍 **Validation**: Đảm bảo trang load hoàn toàn

**Output:** Ở trang danh sách đơn hàng với date picker

---

### 📅 **BƯỚC 5: THIẾT LẬP KHOẢNG THỜI GIAN** (Tính năng chính)

```python
def set_date_range(self, date_from, date_to, time_type="ecom"):
    # Set hidden date inputs using JavaScript
    self.driver.execute_script(f"document.getElementById('date_from').value = '{date_from}';")
    self.driver.execute_script(f"document.getElementById('date_to').value = '{date_to}';")

    # Update UI display
    display_text = f"{date_from} - {date_to}"
    self.driver.execute_script(f"document.getElementById('daterange-btn-detail').textContent = '{display_text}';")

    # Set time type (odoo/ecom)
    time_type_select = Select(self.driver.find_element(By.ID, "time_type"))
    time_type_select.select_by_value(time_type)
```

**Chi tiết thông minh:**

- 🎯 **JavaScript injection**: Thao tác trực tiếp DOM
- 📅 **Date format**: YYYY-MM-DD standard
- 🕐 **Time types**:
  - `"ecom"` - Thời gian sàn TMĐT
  - `"odoo"` - Thời gian hệ thống
- 🖥️ **UI sync**: Cập nhật display cho user

**Output:** Date range được thiết lập chính xác

---

### 📊 **BƯỚC 6: THIẾT LẬP GIỚI HẠN HIỂN THỊ**

```python
def set_display_limit(self, limit=2000):
    limit_select = Select(self.driver.find_element(By.ID, "limit"))
    limit_select.select_by_value(str(limit))
```

**Chi tiết:**

- 🔢 **Default limit**: 2000 đơn hàng
- 📋 **Configurable**: Có thể tùy chỉnh
- 🎯 **Select dropdown**: Sử dụng Selenium Select

**Output:** Giới hạn hiển thị được thiết lập

---

### 🔍 **BƯỚC 7: ÁP DỤNG BỘ LỌC**

```python
def apply_filters(self):
    # Click search button
    search_button = WebDriverWait(self.driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.btn-filter"))
    )
    search_button.click()

    # Wait for AJAX completion
    WebDriverWait(self.driver, 30).until(
        lambda driver: driver.execute_script("return typeof $ !== 'undefined' && $.active == 0")
    )
```

**Chi tiết xử lý:**

- 🔍 **Filter button**: Tìm và click `button.btn-filter`
- ⏳ **AJAX wait**: Chờ jQuery requests hoàn thành
- 📊 **Table update**: Chờ bảng dữ liệu refresh
- 🕐 **Timeouts**: 30s cho việc load dữ liệu

**Output:** Dữ liệu được filter và hiển thị

---

### 📊 **BƯỚC 8: TRÍCH XUẤT DỮ LIỆU ĐƠN HÀNG**

```python
def get_orders_data(self):
    # Wait for table
    table = WebDriverWait(self.driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#orderTB tbody"))
    )

    rows = table.find_elements(By.TAG_NAME, "tr")
    orders_data = []

    for i, row in enumerate(rows):
        cells = row.find_elements(By.TAG_NAME, "td")

        order_data = {
            'row_index': i + 1,
            'total_columns': len(cells),
            'scraped_at': datetime.now().isoformat()
        }

        # Extract all cell data
        for j, cell in enumerate(cells):
            order_data[f'col_{j+1}'] = cell.text.strip()

        # Extract order ID from link
        id_link = row.find_elements(By.CSS_SELECTOR, "a[href*='/so/detail/']")
        if id_link:
            href = id_link[0].get_attribute('href')
            order_id = href.split('/so/detail/')[-1].split('?')[0]
            order_data['id'] = order_id
```

**Chi tiết extraction:**

- 🎯 **Table selector**: `#orderTB tbody`
- 📋 **Row processing**: Xử lý từng row một
- 🔢 **Dynamic columns**: Lưu tất cả columns `col_1`, `col_2`, ...
- 🆔 **Order ID extraction**: Parse từ link `/so/detail/`
- 📊 **Progress tracking**: Log mỗi 50 rows
- ⏰ **Timestamp**: Thêm `scraped_at` cho mỗi record

**Output:** Array các đơn hàng với đầy đủ thông tin

---

### 📁 **BƯỚC 9: XUẤT DỮ LIỆU**

```python
def export_data(self, orders_data, date_from, date_to):
    df = pd.DataFrame(orders_data)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    date_range = f"{date_from.replace('-', '')}_{date_to.replace('-', '')}"

    # 1. CSV export
    csv_file = f"data/orders_by_date_{date_range}_{timestamp}.csv"
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')

    # 2. Summary report
    summary_file = f"data/summary_by_date_{date_range}_{timestamp}.txt"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("📊 BÁO CÁO ĐƠN HÀNG THEO NGÀY\n")
        f.write(f"📅 Khoảng thời gian: {date_from} đến {date_to}\n")
        f.write(f"📦 Tổng số đơn hàng: {len(orders_data)}\n")
```

**Chi tiết export:**

- 📊 **CSV format**: UTF-8-sig cho tiếng Việt
- 📄 **Summary report**: Text file dễ đọc
- 🏷️ **Naming convention**: `orders_by_date_{daterange}_{timestamp}`
- 📂 **Directory**: Tự tạo thư mục `data/` nếu chưa có
- 📋 **Metadata**: Include sample data và statistics

**Output:** 2 files - CSV data + Summary report

---

## 🎯 **WORKFLOW TỔNG THỂ**

```mermaid
graph TD
    A[Khởi tạo ONEDateAutomation] --> B[Setup WebDriver]
    B --> C[Login vào ONE]
    C --> D[Navigate to Orders Page]
    D --> E[Set Date Range]
    E --> F[Set Display Limit]
    F --> G[Apply Filters]
    G --> H[Wait for AJAX Load]
    H --> I[Extract Orders Data]
    I --> J[Export CSV + Summary]
    J --> K[Cleanup & Return Results]
```

---

## 🚀 **CÁC PHƯƠNG THỨC TIỆN ÍCH**

### 1. **Presets thời gian**

```python
run_today()      # Hôm nay
run_yesterday()  # Hôm qua
run_this_week()  # Tuần này
run_this_month() # Tháng này
```

### 2. **Phương thức chính**

```python
run_by_date_range(
    date_from="2025-06-29",
    date_to="2025-06-30",
    time_type="ecom",      # "ecom" hoặc "odoo"
    limit=2000,            # Giới hạn records
    headless=True          # Chạy ngầm
)
```

---

## 📊 **THỐNG KÊ PERFORMANCE**

| **Thông số** | **Giá trị** |
|--------------|-------------|
| **Setup time** | 3-5 giây |
| **Login time** | 2-8 giây |
| **Filter time** | 5-15 giây |
| **Data extraction** | 0.1-0.2s/row |
| **Export time** | 1-3 giây |
| **Total for 100 orders** | 20-40 giây |

---

## ✅ **ĐIỂM MẠNH**

🎯 **Chuyên biệt date range**: Focus vào lọc theo thời gian
⚡ **Performance tối ưu**: Headless, anti-detection
📊 **Export đa dạng**: CSV + Summary reports
🔄 **Presets tiện lợi**: Today, yesterday, week, month
🛡️ **Error handling**: Comprehensive try-catch
📅 **Flexible dates**: Support cả ecom và odoo time

## 🎯 **USE CASES**

✅ **Báo cáo hàng ngày**: Lấy đơn hàng theo ngày cụ thể
✅ **Phân tích tuần/tháng**: Lấy dữ liệu khoảng thời gian
✅ **Historical data**: Truy xuất dữ liệu cũ
✅ **Scheduled reports**: Tích hợp với cron jobs
✅ **Data migration**: Backup dữ liệu theo thời gian

**🏆 Kết luận**: File này là công cụ chuyên biệt và hiệu quả cho việc lấy đơn hàng theo thời gian!
