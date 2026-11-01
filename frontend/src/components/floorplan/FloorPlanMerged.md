# FloorPlanMerged Component

## Overview

`FloorPlanMerged` is an optimized floor plan component that addresses the limitation of the original `FloorPlan` component which could only handle rectangular room shapes (scaled cube instances). This new component can handle rooms with arbitrary shapes while maintaining the same visual style and behavior.

## Key Features

### 1. **Support for Arbitrary Shapes**

- Uses actual mesh geometries from GLTF files instead of scaled box instances
- Preserves the original shape of each room regardless of geometry complexity
- Handles non-rectangular rooms, L-shapes, irregular polygons, etc.

### 2. **Optimized Performance (Low Draw Calls)**

- Merges all geometries of the same color into a single mesh using `BufferGeometryUtils.mergeGeometries`
- Groups rooms, stairs, lifts, and floors by color before merging
- Results in minimal draw calls per floor (one mesh per color/type combination)
- Much more efficient than individual instances for complex shapes

### 3. **Preserved Click Behavior**

- Maintains room clicking functionality identical to the original component
- Tracks individual room boundaries during the merge process
- Uses bounding box containment and distance calculations to determine which room was clicked
- Integrates seamlessly with `useClickHandler` hook

### 4. **Same Visual Style**

- Identical colors and styling as the original FloorPlan
  - Room colors based on floor number
  - Search highlighting (coral for exact match, grey for non-matching)
  - Stairs color: `#d69754`
  - Lift color: `#e74514`
  - Floor color: `#6e6e6e`
  - Outline color: `#3f3f3f`
- Same opacity behavior for picking mode
- Same outline thickness and styling

### 5. **Full Feature Parity**

- All search functionality preserved
- Building display modes (primary/context/hidden)
- Floor visibility controls
- Gap controls between floors
- Support for all floor levels (0-3)
- Leva controls panel

## Technical Implementation

### Geometry Processing

```typescript
// Transform mesh geometry and apply Y offset
const transformMeshGeometry = (mesh: Mesh, yOffset: number) => {
  const geometry = mesh.geometry.clone()
  const matrix = new Matrix4()
  matrix.compose(mesh.position, mesh.quaternion, mesh.scale)
  geometry.applyMatrix4(matrix)
  geometry.translate(0, yOffset, 0)
  return { geometry, roomName: mesh.name || "" }
}
```

### Merging Strategy

1. Group geometries by color and type
2. Store room metadata (name and bounds) alongside geometries
3. Merge all geometries of the same color using `BufferGeometryUtils`
4. Create single mesh per color group

### Click Detection

1. When a merged mesh is clicked, get the click point in 3D space
2. Check which room's bounding box contains the point
3. If no exact containment, find the closest room by distance to center
4. Trigger the appropriate room click handler

## Usage

Replace the import in your scene:

```tsx
// Old
import FloorPlan from "@/components/FloorPlan"

// New
import FloorPlanMerged from "@/components/FloorPlanMerged"

// In your component
;<FloorPlanMerged pickingOnly={false} />
```

The API is identical to the original FloorPlan component.

## Performance Benefits

### Draw Calls Comparison

**Original FloorPlan:**

- One draw call per Instance group (one per floor)
- Instances are efficient but limited to box geometry

**FloorPlanMerged:**

- One mesh per color/type combination
- Example: Floor 0 might have 3-5 merged meshes total:
  - 1 for all rooms of color A
  - 1 for all rooms of color B (search results)
  - 1 for all rooms of color C (not found)
  - 1 for all stairs
  - 1 for all lifts

### Memory Comparison

- Original: Lower memory per room (just transform data)
- New: Higher memory for geometry storage, but mitigated by merging
- Trade-off: Slightly more memory for geometry flexibility

## Dependencies

- `three/addons/utils/BufferGeometryUtils.js` - For geometry merging
- All existing hooks and atoms from the original component
- Same GLTF files from `useFloorPlanData`

## Limitations & Considerations

1. **Click Precision**: Click detection uses bounding boxes, so for very irregular shapes, the click might register for an adjacent room in edge cases
2. **Memory**: Stores more geometry data than instanced approach
3. **Dynamic Updates**: Color changes require full geometry re-merge (search operations trigger this)

## Future Improvements

1. **More Precise Click Detection**: Use ray-triangle intersection testing instead of bounding boxes
2. **Selective Re-merging**: Only re-merge geometries when their colors change
3. **LOD Support**: Create lower-detail merged meshes for distant views
4. **Caching**: Cache merged geometries when search state doesn't change

## Testing Checklist

- [ ] Room clicking works for all room types
- [ ] Search highlights correct rooms
- [ ] Floor switching works correctly
- [ ] Building display modes (primary/context) work
- [ ] Performance is acceptable (check FPS)
- [ ] No visual differences from original component
- [ ] Outline rendering is correct
- [ ] Pick mode (raycast overlay) works correctly
