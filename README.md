# 📊 Sliding Window Median Visualizer

Interactive visualization of the **Sliding Window Median Algorithm** (LeetCode Problem 480) using the Dual-Heap approach with lazy deletion.

![Visualization Preview](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan)

## 🎯 Features

### 1. Why Median? (Intro Mode)
- **Interactive stock chart simulation** showing real-time comparison between median and average
- Demonstrates how **outliers distort the average** while **median remains robust**
- Step-by-step window sliding with candlestick visualization

### 2. Dual Heap Algorithm (Algo Mode)
- **Visual binary tree representation** of both heaps (Max-Heap & Min-Heap)
- **Synchronized Python code viewer** with line highlighting
- Step-by-step execution showing:
  - Element insertion into heaps
  - Lazy deletion marking
  - Heap balancing operations
  - Median calculation
- **Final result**: Median of all sliding window medians

### 3. Simple Mode (Step-by-step example)
- A focused, minimal walkthrough for a single, easy-to-follow example.
- Default example: `[40, 50, 70, 30, 90, 20, 80]` with `k = 3` — this demonstrates lazy deletion when an outgoing element is not at the heap top.
- Use controls to step through `add`, `lazy delete`, `balance`, and `median` phases; code viewer highlights the corresponding lines.

### 4. Multi-language Support 🌍
- 🇸🇮 Slovenščina (Slovenian)
- 🇺🇸 English
- 🇩🇪 Deutsch (German)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nozelk/Sliding-window-median.git
cd Sliding-window-median

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AlgoMode.tsx      # Algorithm visualization with heaps & code
│   ├── SimpleMode.tsx    # Simple step-by-step example (small array)
│   ├── CodeViewer.tsx    # Python code display with line highlighting
│   ├── HeapViz.tsx       # Binary tree heap visualization
│   ├── IntroMode.tsx     # Median vs Average comparison
│   ├── LandingPage.tsx   # Main menu
│   ├── LanguageSelector.tsx
│   └── StockChart.tsx    # Candlestick chart component
├── lib/
│   ├── algorithm.ts      # Dual-heap algorithm implementation
│   └── i18n.tsx          # Internationalization (SI/EN/DE)
├── App.tsx
└── main.tsx
```

## 🧮 Algorithm Overview

The **Sliding Window Median** problem is solved using two heaps:

| Heap | Type | Contains |
|------|------|----------|
| **Left (small)** | Max-Heap | Smaller half of elements |
| **Right (large)** | Min-Heap | Larger half of elements |

### Key Operations:
1. **Add**: Insert element into appropriate heap based on current median
2. **Remove**: Mark element for lazy deletion
3. **Balance**: Ensure `|left| - |right| ≤ 1`
4. **Prune**: Remove lazily deleted elements from heap tops
5. **Median**: Return top of left heap (odd k) or average of both tops (even k)

**Time Complexity**: O(n log k)  
**Space Complexity**: O(k)

## 🔗 Related

- [LeetCode Problem 480](https://leetcode.com/problems/sliding-window-median/)
- [Python Solution (480.py)](https://github.com/nozelk/Sliding-window-median/blob/main/480.py)

## 🌐 Live Demo

[**View Live Demo**](https://nozelk.github.io/Sliding-window-median/)

## 📝 License

MIT License - Feel free to use for educational purposes.

---

© 2025 [@nozelk](https://github.com/nozelk)
