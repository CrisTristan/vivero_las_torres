---
name: debug-signal-sync
description: "Use when debugging Angular Signal data disappearing after CRUD operations in services. Diagnoses sync issues between backend responses and signal state updates."
---

# Debug Angular Signal Sync Issues

When data disappears after updating/creating items via signals, follow this diagnostic workflow.

## Problem Symptoms
- ✗ List appears empty after edit/add
- ✗ Item disappears from view
- ✗ Data inconsistency between backend and UI
- ✗ Signal updates not triggering UI refresh

## Diagnostic Checklist

### 1. Response Validation
Check if the backend response contains expected data:

```
❓ Is response.data.data defined? Or is it just response.data?
❓ Does the response include the required ID field?
❓ Are all nested properties present and not undefined?
```

**Action**: Add response validation before updating signal:
```typescript
if (!responseData || !responseData.id) {
  console.error('Invalid response structure:', response);
  return; // Don't proceed with corrupted data
}
```

### 2. Signal Update Safety
When updating arrays in signals, ensure you preserve data integrity:

```
❓ Using .map() or .filter()? Ensure mapping returns actual objects, not undefined
❓ Using spread operators to merge? Or replacing entire objects?
❓ Is the updated reference different from the original?
```

**Action**: Safe merge pattern for updates:
```typescript
signal.update(list => 
  list.map(item => 
    item.id === id ? { ...item, ...newData } : item // Merge, don't replace
  )
);
```

### 3. Signal Reactivity
Angular Signals detect changes via reference equality. Array mutations can fail:

```
❓ Are you mutating the array in-place instead of creating new arrays?
❓ Does the track function use stable identifiers (like IDs)?
```

**Action**: Always create new arrays/objects:
```typescript
// Bad: Mutates in-place
list[0] = newItem;

// Good: Creates new array reference
list = [...list.slice(0, 0), newItem, ...list.slice(1)];
// Or simpler:
signal.set([...signal(), ...newItems]);
```

### 4. Backend Sync Fallback
When in doubt about response format, reload from source:

```typescript
private async reloadData() {
  const response = await fetchData();
  if (response.ok) {
    signal.set(response.data);
  }
}
```

## Quick Debug Template

Apply this to your service method:

```typescript
async updateItem(id: number, data: any) {
  const response = await api.update(id, data);
  
  if (response.status === 200) {
    const updated = response.data.data; // Check structure!
    
    // Validate
    if (!updated || !updated.id) {
      console.error('Invalid response:', response);
      return this.reload(); // Fallback
    }
    
    // Update safely
    signal.update(list =>
      list.map(item =>
        item.id === id ? { ...item, ...updated } : item
      )
    );
  }
}
```

## Console Debugging
Add these logs to trace the issue:

```typescript
console.log('Before update:', signal());
console.log('Response data:', response.data);
console.log('After update:', signal());
```

Check the console to confirm:
1. Data before update exists ✓
2. Response has valid data ✓  
3. Data after update still exists ✓
