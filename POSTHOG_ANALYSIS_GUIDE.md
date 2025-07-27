# PostHog Analysis Guide for COSCA Semantic Tagging

## 🎯 **Quick Health Check**

### **Step 1: Basic Event Validation**
Go to PostHog → Events → Filter by event name

**Look for:**
- `extension_activated` events (shows extension is starting up)
- `semantic_scan` events (shows files are being analyzed)

**Red flags:**
- No events at all = telemetry not working
- Only `extension_activated` but no `semantic_scan` = analysis not working
- Gaps in timeline = potential crashes or issues

### **Step 2: Extension Usage Patterns**
Filter events by `semantic_scan` and look at:

**Properties to check:**
- `language` - What file types are being analyzed?
- `total_tags` - How many patterns found per file?
- `is_infra_file` - Are we detecting infrastructure files?

**Good signs:**
- Multiple languages (javascript, terraform, yaml, python)
- `total_tags` between 5-50 per file (reasonable range)
- `is_infra_file: true` for some files

**Concerning signs:**
- Only one language type (limited testing)
- `total_tags: 0` frequently (patterns not matching)
- `is_infra_file: false` always (not finding infrastructure)

### **Step 3: COSCA Readiness Analysis**
Look at these key properties in `semantic_scan` events:

**Infrastructure Detection:**
- `infra_tag_count` - How many infrastructure patterns found
- `iac_tags` - Infrastructure as Code patterns
- `cloud_tags` - Cloud service patterns
- `container_tags` - Docker/Kubernetes patterns

**Purpose-Driven Metadata:**
- `has_purpose_metadata` - Files with COSCA metadata
- `purpose_tags` - Declared purposes found
- `expiry_tags` - Lifecycle expectations found
- `owner_tags` - Responsibility assignments found

## 📈 **Creating Useful Insights**

### **Insight 1: Extension Adoption**
```sql
-- Daily active users
SELECT 
  toDate(timestamp) as date,
  uniq(properties.session_id) as daily_users
FROM events 
WHERE event = 'extension_activated'
GROUP BY date
ORDER BY date
```

### **Insight 2: File Type Analysis**
```sql
-- Most analyzed file types
SELECT 
  properties.language,
  count() as scans,
  avg(properties.total_tags) as avg_tags_per_file
FROM events 
WHERE event = 'semantic_scan'
GROUP BY properties.language
ORDER BY scans DESC
```

### **Insight 3: Infrastructure Detection Rate**
```sql
-- Infrastructure file detection
SELECT 
  toDate(timestamp) as date,
  countIf(properties.is_infra_file = true) as infra_files,
  count() as total_files,
  (infra_files / total_files) * 100 as infra_detection_rate
FROM events 
WHERE event = 'semantic_scan'
GROUP BY date
ORDER BY date
```

### **Insight 4: COSCA Readiness Score**
```sql
-- Average COSCA readiness by language
SELECT 
  properties.language,
  avg(properties.infra_tag_count + properties.purpose_tags + properties.expiry_tags + properties.owner_tags) as avg_cosca_score,
  count() as files_analyzed
FROM events 
WHERE event = 'semantic_scan'
GROUP BY properties.language
ORDER BY avg_cosca_score DESC
```

### **Insight 5: Purpose-Driven Adoption**
```sql
-- Files with purpose metadata over time
SELECT 
  toStartOfWeek(timestamp) as week,
  countIf(properties.has_purpose_metadata = true) as files_with_purpose,
  count() as total_files,
  (files_with_purpose / total_files) * 100 as purpose_adoption_rate
FROM events 
WHERE event = 'semantic_scan'
GROUP BY week
ORDER BY week
```

## 🚨 **Red Flags to Watch For**

### **Performance Issues:**
- Events suddenly stopping (extension crashed?)
- Very high `total_tags` numbers (>100 per file = performance problem)
- Long gaps between `extension_activated` and first `semantic_scan`

### **Detection Issues:**
- `total_tags: 0` frequently (patterns not working)
- `is_infra_file: false` always (not finding infrastructure)
- Same `session_id` with wildly different results (inconsistent analysis)

### **Privacy Issues:**
- Any actual code content in properties (PII leak!)
- File paths or names in data (privacy violation)
- Identifiable information in session IDs

## 📊 **Sample Dashboard Widgets**

### **Widget 1: Daily Extension Usage**
- Chart type: Line chart
- Event: `extension_activated`
- Group by: Date
- Metric: Unique users (by session_id)

### **Widget 2: File Analysis Volume**
- Chart type: Bar chart
- Event: `semantic_scan`
- Group by: `properties.language`
- Metric: Count of events

### **Widget 3: Infrastructure Detection**
- Chart type: Pie chart
- Event: `semantic_scan`
- Group by: `properties.is_infra_file`
- Metric: Count of events

### **Widget 4: COSCA Readiness Trend**
- Chart type: Line chart
- Event: `semantic_scan`
- Group by: Date
- Metric: Average of (`properties.infra_tag_count` + `properties.purpose_tags`)

## 🎯 **What Good Data Looks Like**

### **Healthy Extension:**
```json
// extension_activated event
{
  "event": "extension_activated",
  "properties": {
    "session_id": "session_abc123_1706234567890",
    "vscode_version": "1.85.0",
    "extension_version": "0.1.0"
  }
}

// semantic_scan event
{
  "event": "semantic_scan",
  "properties": {
    "language": "terraform",
    "total_tags": 15,
    "infra_tag_count": 12,
    "is_infra_file": true,
    "has_purpose_metadata": true,
    "purpose_tags": 3,
    "expiry_tags": 2,
    "owner_tags": 2,
    "tag_counts": {
      "iac": 4,
      "cloud": 3,
      "storage": 2,
      "purpose": 3,
      "expiry": 2,
      "owner": 2
    }
  }
}
```

## 🔧 **Troubleshooting Common Issues**

### **No Events Showing Up:**
1. Check if telemetry is enabled in VSCode settings
2. Verify PostHog API key is correct
3. Check VSCode Developer Console for errors
4. Ensure network connectivity to PostHog

### **Events But No Semantic Tags:**
1. Check if files being opened have detectable patterns
2. Verify pattern matching is working (console logs)
3. Test with known infrastructure files (Terraform, Kubernetes)

### **Inconsistent Data:**
1. Check for extension crashes (gaps in events)
2. Verify cache is working properly
3. Look for error patterns in console logs

---

**💡 Pro Tip:** Start with the "Events" tab and just look at the raw events first. Once you understand what data is coming in, then create insights and dashboards to analyze trends.