from typing import List
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
        
        return result
