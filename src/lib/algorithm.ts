export type StepType = 
  | 'INIT'
  | 'ADD_WINDOW'
  | 'REMOVE_WINDOW'
  | 'ADD_HEAP'
  | 'REMOVE_HEAP'
  | 'BALANCE'
  | 'MEDIAN'
  | 'LAZY_DELETE';

export const PYTHON_CODE = `from typing import List
from heapq import heappush, heappop


class Solution:
    def medianSlidingWindow(self, nums: List[int], k: int) -> List[float]:
        if k == 1:
            return [float(x) for x in nums]
        
        small = []
        large = []
        lazy = {}
        sz = [0, 0]
        
        def prune_small():
            while small and lazy.get(-small[0], 0):
                v = -heappop(small)
                lazy[v] -= 1
                if not lazy[v]:
                    del lazy[v]
        
        def prune_large():
            while large and lazy.get(large[0], 0):
                v = heappop(large)
                lazy[v] -= 1
                if not lazy[v]:
                    del lazy[v]
        
        def balance():
            if sz[0] > sz[1] + 1:
                prune_small()
                heappush(large, -heappop(small))
                sz[0] -= 1
                sz[1] += 1
            elif sz[0] < sz[1]:
                prune_large()
                heappush(small, -heappop(large))
                sz[1] -= 1
                sz[0] += 1
        
        def add(x):
            if not small or x <= -small[0]:
                heappush(small, -x)
                sz[0] += 1
            else:
                heappush(large, x)
                sz[1] += 1
            balance()
        
        def remove(x):
            lazy[x] = lazy.get(x, 0) + 1
            if x <= -small[0]:
                sz[0] -= 1
                if x == -small[0]:
                    prune_small()
            else:
                sz[1] -= 1
                if large and x == large[0]:
                    prune_large()
            balance()
        
        def median():
            prune_small()
            prune_large()
            if k % 2 != 0:
                return float(-small[0])
            return (-small[0] + large[0]) / 2.0
        

        for i in range(k):
            add(nums[i])
        
        n = len(nums)
        result = [0.0] * (n - k + 1)
        result[0] = median()

        for i in range(k, n):
            add(nums[i])
            remove(nums[i - k])
            result[i - k + 1] = median()
        
        return result`;

export type SimulationStep = {
  id: number;
  type: StepType;
  description: string;
  window: number[];
  windowIndices: [number, number];
  smallHeap: number[];
  largeHeap: number[];
  delayed: Record<number, number>;
  median: number | null;
  activeElement?: number;
  highlightHeaps?: ('small' | 'large')[];
  codeLines: number[]; // Highlighted lines (1-based)
};

class VisualHeap {
// ... (VisualHeap implementation remains same)
  data: number[];
  isMin: boolean;

  constructor(isMin: boolean = true) {
    this.data = [];
    this.isMin = isMin;
  }

  push(val: number) {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): number | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): number | undefined {
    return this.data[0];
  }

  size(): number {
    return this.data.length;
  }

  private compare(a: number, b: number): boolean {
    if (this.isMin) return a < b;
    return a > b;
  }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.compare(this.data[idx], this.data[parentIdx])) {
        [this.data[idx], this.data[parentIdx]] = [this.data[parentIdx], this.data[idx]];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  private bubbleDown(idx: number) {
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let swapIdx = idx;

      if (leftIdx < this.data.length && this.compare(this.data[leftIdx], this.data[swapIdx])) {
        swapIdx = leftIdx;
      }
      if (rightIdx < this.data.length && this.compare(this.data[rightIdx], this.data[swapIdx])) {
        swapIdx = rightIdx;
      }

      if (swapIdx !== idx) {
        [this.data[idx], this.data[swapIdx]] = [this.data[swapIdx], this.data[idx]];
        idx = swapIdx;
      } else {
        break;
      }
    }
  }
  
  toArray() {
    return [...this.data];
  }
}

export const K = 3;
export const SAMPLE_DATA = [
  100, 105, 102, // Stabilno
  108, 450, 115, // OSAMELEC 1 (450) - prvi skok
  112, 118, 120, // Normalno
  125, 50, 130,  // OSAMELEC 2 (50) - drugi skok (navzdol)
  128
];

export function generateSimulation(nums: number[], k: number): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let stepId = 0;

  const small = new VisualHeap(false); 
  const large = new VisualHeap(true);  
  const delayed: Record<number, number> = {};
  const sz = [0, 0]; 
  
  const window: number[] = [];
  let windowStart = 0;

  const snapshot = (type: StepType, description: string, codeLines: number[], activeElement?: number, highlightHeaps?: ('small' | 'large')[]) => {
    let median = null;
    if (sz[0] + sz[1] > 0) {
        const sTop = small.peek();
        const lTop = large.peek();
        if (sz[0] > sz[1] && sTop !== undefined) median = sTop;
        else if (sTop !== undefined && lTop !== undefined) median = (sTop + lTop) / 2;
    }

    steps.push({
      id: stepId++,
      type,
      description,
      window: [...window],
      windowIndices: [windowStart, windowStart + window.length - 1],
      smallHeap: small.toArray(),
      largeHeap: large.toArray(),
      delayed: { ...delayed },
      median,
      activeElement,
      highlightHeaps,
      codeLines
    });
  };

  const prune_small = () => {
    while (small.size() > 0) {
      const val = small.peek()!;
      if (delayed[val] && delayed[val] > 0) {
        small.pop();
        delayed[val]--;
        if (delayed[val] === 0) delete delayed[val];
        snapshot('LAZY_DELETE', `Lazy delete (Small): Odstranim ${val} iz vrha`, [15, 16, 17, 18, 19, 20], val, ['small']);
      } else {
        break;
      }
    }
  };

  const prune_large = () => {
    while (large.size() > 0) {
      const val = large.peek()!;
      if (delayed[val] && delayed[val] > 0) {
        large.pop();
        delayed[val]--;
        if (delayed[val] === 0) delete delayed[val];
        snapshot('LAZY_DELETE', `Lazy delete (Large): Odstranim ${val} iz vrha`, [22, 23, 24, 25, 26, 27], val, ['large']);
      } else {
        break;
      }
    }
  };

  const balance = () => {
    if (sz[0] > sz[1] + 1) {
      prune_small();
      const val = small.pop()!;
      large.push(val);
      sz[0]--;
      sz[1]++;
      prune_small(); 
      snapshot('BALANCE', `Uravnoteženje: Premik ${val} iz Leve v Desno`, [29, 30, 31, 32, 33, 34], val, ['small', 'large']);
    } else if (sz[0] < sz[1]) {
      prune_large();
      const val = large.pop()!;
      small.push(val);
      sz[1]--;
      sz[0]++;
      prune_large(); 
      snapshot('BALANCE', `Uravnoteženje: Premik ${val} iz Desne v Levo`, [35, 36, 37, 38, 39], val, ['small', 'large']);
    }
  };

  const add = (x: number) => {
    if (small.size() === 0 || x <= small.peek()!) {
      small.push(x);
      sz[0]++;
      snapshot('ADD_HEAP', `Dodaj ${x} v Levo kopico (manjši)`, [41, 42, 43, 44], x, ['small']);
    } else {
      large.push(x);
      sz[1]++;
      snapshot('ADD_HEAP', `Dodaj ${x} v Desno kopico (večji)`, [45, 46, 47], x, ['large']);
    }
    balance();
  };

  const remove = (x: number) => {
    delayed[x] = (delayed[x] || 0) + 1;
    
    if (small.size() > 0 && x <= small.peek()!) {
      sz[0]--;
      if (x === small.peek()!) {
        prune_small();
      }
    } else {
      sz[1]--;
      if (large.size() > 0 && x === large.peek()!) {
        prune_large();
      }
    }
    snapshot('REMOVE_HEAP', `Označi ${x} za izbris (delayed)`, [50, 51, 52, 53, 54, 55, 56, 57, 58, 59], x);
    balance();
    
    prune_small();
    prune_large();
  };

  const get_median = () => {
    prune_small();
    prune_large();
    if (k % 2 === 1) { 
      return small.peek()!;
    }
    return (small.peek()! + large.peek()!) / 2.0;
  };

  // --- Izvajanje simulacije ---

  // Začetni korak - inicializacija
  snapshot('INIT', `Inicializacija: prazne kopice, k=${k}`, [10, 11, 12, 13], undefined, []);

  // Inicializacija prvega okna
  for (let i = 0; i < k; i++) {
    window.push(nums[i]);
    snapshot('ADD_WINDOW', `Dodaj nums[${i}] = ${nums[i]} v okno`, [70, 71], nums[i]);
    add(nums[i]);
  }
  
  let m = get_median();
  snapshot('MEDIAN', `Mediana prvega okna: ${m}`, [62, 63, 64, 65, 66, 67, 73, 74, 75], undefined, ['small', 'large']);

  // Drsenje okna
  for (let i = k; i < nums.length; i++) {
    const outElem = nums[i - k];
    const inElem = nums[i];
    
    windowStart++;
    window.shift();
    window.push(inElem);
    
    snapshot('ADD_WINDOW', `Okno se premakne: ${outElem} ven, ${inElem} noter`, [77, 78, 79, 80], inElem);
    
    add(inElem);
    remove(outElem);
    
    m = get_median();
    snapshot('MEDIAN', `Nova mediana: ${m}`, [80, 81], undefined, ['small', 'large']);
  }

  return steps;
}