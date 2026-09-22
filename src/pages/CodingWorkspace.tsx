import React, { useState } from 'react';
import {
  Play, Send, RotateCcw, ArrowRight, CheckCircle2, AlertCircle,
  Code, FileText, Lightbulb, History, Sparkles, Terminal,
  Search, Filter, Check, Copy, HelpCircle, Layers, Cpu
} from 'lucide-react';
import { CodingEvaluation, AIHintResponse } from '../types';
import { api } from '../services/api';
import { userStore } from '../services/userStore';

interface CodingWorkspaceProps {
  onProceedToSQL: () => void;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  categoryGroup: 'Arrays & Two Pointers' | 'Sliding Window' | 'Stacks & Queues' | 'Trees & Graphs' | 'Dynamic Programming' | 'System Design';
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  defaultTestCase: { input: string; target?: string };
  starterCode: {
    python: string;
    javascript: string;
    java: string;
    cpp: string;
  };
}

const PROBLEMS: Problem[] = [
  {
    id: 'rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Algorithms & Binary Search',
    categoryGroup: 'Arrays & Two Pointers',
    description: `Given a rotated sorted integer array \`nums\` and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. You must write an algorithm with O(log N) runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 is located at index 4 in the rotated array.' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '3 is not present in the array.' }
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.', 'nums is guaranteed to be rotated at some pivot.'],
    defaultTestCase: { input: '[4, 5, 6, 7, 0, 1, 2]', target: '0' },
    starterCode: {
      python: `def search_rotated(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`,
      javascript: `function searchRotated(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid]) high = mid - 1;
            else low = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[high]) low = mid + 1;
            else high = mid - 1;
        }
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int low = 0, high = nums.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
};`
    }
  },
  {
    id: 'two-sum',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Easy',
    category: 'Two Pointers & Arrays',
    categoryGroup: 'Arrays & Two Pointers',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number. Return indices [index1, index2] (1-based).`,
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', explanation: 'The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.' }
    ],
    constraints: ['2 <= numbers.length <= 3 * 10^4', '-1000 <= numbers[i] <= 1000', 'Exactly one valid solution exists.'],
    defaultTestCase: { input: '[2, 7, 11, 15]', target: '9' },
    starterCode: {
      python: `def two_sum(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        curr = numbers[l] + numbers[r]
        if curr == target:
            return [l + 1, r + 1]
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []`,
      javascript: `function twoSum(numbers, target) {
    let l = 0, r = numbers.length - 1;
    while (l < r) {
        let sum = numbers[l] + numbers[r];
        if (sum === target) return [l + 1, r + 1];
        if (sum < target) l++;
        else r--;
    }
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return new int[]{l + 1, r + 1};
            if (sum < target) l++; else r--;
        }
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int l = 0, r = numbers.size() - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return {l + 1, r + 1};
            if (sum < target) l++; else r--;
        }
        return {};
    }
};`
    }
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window & Hash Table',
    categoryGroup: 'Sliding Window',
    description: `Given a string \`s\`, find the length of the longest substring without duplicate characters. Must achieve optimal O(N) runtime.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    defaultTestCase: { input: '"abcabcbb"' },
    starterCode: {
      python: `def length_of_longest_substring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      javascript: `function lengthOfLongestSubstring(s) {
    let charMap = new Map();
    let left = 0, maxLen = 0;
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (charMap.has(char) && charMap.get(char) >= left) {
            left = charMap.get(char) + 1;
        }
        charMap.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> seen;
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.size(); right++) {
            if (seen.count(s[right]) && seen[s[right]] >= left) {
                left = seen[s[right]] + 1;
            }
            seen[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack & Strings',
    categoryGroup: 'Stacks & Queues',
    description: `Given a string \`s\` containing '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type in the correct order.`,
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only ()[]{}.'],
    defaultTestCase: { input: '"()[]{}"' },
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    stack = []
    lookup = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in lookup:
            top = stack.pop() if stack else '#'
            if lookup[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      javascript: `function isValid(s) {
    const stack = [];
    const lookup = { ')': '(', '}': '{', ']': '[' };
    for (const ch of s) {
        if (lookup[ch]) {
            const top = stack.pop() || '#';
            if (lookup[ch] !== top) return false;
        } else {
            stack.push(ch);
        }
    }
    return stack.length === 0;
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`
    }
  },
  {
    id: 'merge-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked Lists & Two Pointers',
    categoryGroup: 'Arrays & Two Pointers',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`. Merge the two lists into one sorted list and return its head.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    constraints: ['The number of nodes in both lists is in range [0, 50].', '-100 <= Node.val <= 100'],
    defaultTestCase: { input: '[1, 2, 4]', target: '[1, 3, 4]' },
    starterCode: {
      python: `def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    while l1 and l2:
        if l1.val < l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 or l2
    return dummy.next`,
      javascript: `function mergeTwoLists(l1, l2) {
    let dummy = new ListNode(0);
    let tail = dummy;
    while (l1 && l2) {
        if (l1.val < l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = l1 || l2;
    return dummy.next;
}`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (l1 && l2) {
            if (l1->val < l2->val) {
                tail->next = l1;
                l1 = l1->next;
            } else {
                tail->next = l2;
                l2 = l2->next;
            }
            tail = tail->next;
        }
        tail->next = l1 ? l1 : l2;
        return dummy.next;
    }
};`
    }
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Dynamic Programming & Arrays',
    categoryGroup: 'Dynamic Programming',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum. Implement in linear O(N) time.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    defaultTestCase: { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]' },
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0], currentSum = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        return maxSum;
    }
};`
    }
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Architecture Design',
    difficulty: 'Medium',
    category: 'System Design & Hash Map + Doubly Linked List',
    categoryGroup: 'System Design',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement \`get\` and \`put\` in O(1) average time complexity.`,
    examples: [
      { input: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]', output: '[null, null, null, 1, null, -1]' }
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls will be made to get and put.'],
    defaultTestCase: { input: 'capacity = 2' },
    starterCode: {
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            self.cache.pop(oldest)
        self.cache[key] = value`,
      javascript: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) return -1;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val);
        return val;
    }
    put(key, value) {
        if (this.cache.has(key)) this.cache.delete(key);
        else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}`,
      java: `class LRUCache {
    private final int capacity;
    private final LinkedHashMap<Integer, Integer> map;
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size() > capacity;
            }
        };
    }
    public int get(int key) {
        return map.getOrDefault(key, -1);
    }
    public void put(int key, int value) {
        map.put(key, value);
    }
}`,
      cpp: `class LRUCache {
    int cap;
    list<pair<int, int>> lru;
    unordered_map<int, list<pair<int, int>>::iterator> mp;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!mp.count(key)) return -1;
        lru.splice(lru.begin(), lru, mp[key]);
        return mp[key]->second;
    }
    void put(int key, int value) {
        if (mp.count(key)) {
            lru.splice(lru.begin(), lru, mp[key]);
            mp[key]->second = value;
            return;
        }
        if (lru.size() == cap) {
            mp.erase(lru.back().first);
            lru.pop_back();
        }
        lru.emplace_front(key, value);
        mp[key] = lru.begin();
    }
};`
    }
  },
  {
    id: 'level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees & Breadth-First Search',
    categoryGroup: 'Trees & Graphs',
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level) using a queue-based BFS.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
    defaultTestCase: { input: '[3, 9, 20, null, null, 15, 7]' },
    starterCode: {
      python: `def level_order(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.pop(0)
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result`,
      javascript: `function levelOrder(root) {
    if (!root) return [];
    const result = [], queue = [root];
    while (queue.length > 0) {
        const level = [], len = queue.length;
        for (let i = 0; i < len; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`,
      java: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode cur = queue.poll();
                level.add(cur.val);
                if (cur.left != null) queue.offer(cur.left);
                if (cur.right != null) queue.offer(cur.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = q.size();
            vector<int> level;
            for (int i = 0; i < sz; i++) {
                auto node = q.front(); q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            res.push_back(level);
        }
        return res;
    }
};`
    }
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'Graphs, BFS & DFS Matrix Traversal',
    categoryGroup: 'Trees & Graphs',
    description: `Given an \`m x n\` 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is 0 or 1.'],
    defaultTestCase: { input: '[["1","1","0"],["1","1","0"],["0","0","1"]]' },
    starterCode: {
      python: `def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '#'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                dfs(r, c)
    return islands`,
      javascript: `function numIslands(grid) {
    if (!grid.length) return 0;
    let count = 0;
    function dfs(r, c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;
        grid[r][c] = '#';
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    }
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === '1') { count++; dfs(r, c); }
        }
    }
    return count;
}`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    private void dfs(char[][] g, int r, int c) {
        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '#';
        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
    }
}`,
      cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (size_t r = 0; r < grid.size(); r++) {
            for (size_t c = 0; c < grid[0].size(); c++) {
                if (grid[r][c] == '1') { count++; dfs(grid, r, c); }
            }
        }
        return count;
    }
    void dfs(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size() || g[r][c] != '1') return;
        g[r][c] = '#';
        dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);
    }
};`
    }
  },
  {
    id: 'coin-change',
    title: 'Coin Change Problem',
    difficulty: 'Medium',
    category: 'Dynamic Programming & Knapsack',
    categoryGroup: 'Dynamic Programming',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\`. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return \`-1\`.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    defaultTestCase: { input: 'coins = [1, 2, 5]', target: 'amount = 11' },
    starterCode: {
      python: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      javascript: `function coinChange(coins, amount) {
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (const coin of coins) {
        for (let x = coin; x <= amount; x++) {
            dp[x] = Math.min(dp[x], dp[x - coin] + 1);
        }
    }
    return dp[amount] !== Infinity ? dp[amount] : -1;
}`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int coin : coins) {
            for (int x = coin; x <= amount; x++) {
                dp[x] = Math.min(dp[x], dp[x - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int c : coins) {
            for (int x = c; x <= amount; x++) {
                dp[x] = min(dp[x], dp[x - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`
    }
  },
  {
    id: 'top-k-frequent',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'Heaps & Hash Table & Bucket Sort',
    categoryGroup: 'Arrays & Two Pointers',
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in any order. Your algorithm's time complexity must be better than O(N log N).`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', 'k is in the range [1, number of unique elements].'],
    defaultTestCase: { input: '[1, 1, 1, 2, 2, 3]', target: 'k = 2' },
    starterCode: {
      python: `import collections

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    count = collections.Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for n, c in count.items():
        buckets[c].append(n)
    res = []
    for i in range(len(buckets) - 1, 0, -1):
        for n in buckets[i]:
            res.append(n)
            if len(res) == k:
                return res
    return res`,
      javascript: `function topKFrequent(nums, k) {
    const count = new Map();
    for (const n of nums) count.set(n, (count.get(n) || 0) + 1);
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [n, c] of count) buckets[c].push(n);
    const res = [];
    for (let i = buckets.length - 1; i > 0 && res.length < k; i--) {
        for (const n of buckets[i]) {
            res.push(n);
            if (res.length === k) return res;
        }
    }
    return res;
}`,
      java: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);
        List<Integer>[] buckets = new List[nums.length + 1];
        for (int n : count.keySet()) {
            int freq = count.get(n);
            if (buckets[freq] == null) buckets[freq] = new ArrayList<>();
            buckets[freq].add(n);
        }
        int[] res = new int[k];
        int idx = 0;
        for (int i = buckets.length - 1; i > 0 && idx < k; i--) {
            if (buckets[i] != null) {
                for (int n : buckets[i]) {
                    res[idx++] = n;
                    if (idx == k) return res;
                }
            }
        }
        return res;
    }
}`,
      cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int n : nums) count[n]++;
        vector<vector<int>> buckets(nums.size() + 1);
        for (auto& [n, c] : count) buckets[c].push_back(n);
        vector<int> res;
        for (int i = buckets.size() - 1; i > 0 && res.size() < k; i--) {
            for (int n : buckets[i]) {
                res.push_back(n);
                if (res.size() == k) return res;
            }
        }
        return res;
    }
};`
    }
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers & Monotonic Stack',
    categoryGroup: 'Arrays & Two Pointers',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. Implement in O(N) time and O(1) extra space.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The 6 units of rain water are trapped between the bars.' }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    defaultTestCase: { input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]' },
    starterCode: {
      python: `def trap(height: list[int]) -> int:
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += max(0, left_max - height[l])
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += max(0, right_max - height[r])
    return water`,
      javascript: `function trap(height) {
    if (!height.length) return 0;
    let l = 0, r = height.length - 1;
    let leftMax = height[l], rightMax = height[r];
    let water = 0;
    while (l < r) {
        if (leftMax < rightMax) {
            l++;
            leftMax = Math.max(leftMax, height[l]);
            water += Math.max(0, leftMax - height[l]);
        } else {
            r--;
            rightMax = Math.max(rightMax, height[r]);
            water += Math.max(0, rightMax - height[r]);
        }
    }
    return water;
}`,
      java: `class Solution {
    public int trap(int[] height) {
        if (height.length == 0) return 0;
        int l = 0, r = height.length - 1;
        int leftMax = height[l], rightMax = height[r];
        int water = 0;
        while (l < r) {
            if (leftMax < rightMax) {
                l++;
                leftMax = Math.max(leftMax, height[l]);
                water += Math.max(0, leftMax - height[l]);
            } else {
                r--;
                rightMax = Math.max(rightMax, height[r]);
                water += Math.max(0, rightMax - height[r]);
            }
        }
        return water;
    }
}`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        if (height.empty()) return 0;
        int l = 0, r = height.size() - 1;
        int leftMax = height[l], rightMax = height[r];
        int water = 0;
        while (l < r) {
            if (leftMax < rightMax) {
                l++;
                leftMax = max(leftMax, height[l]);
                water += max(0, leftMax - height[l]);
            } else {
                r--;
                rightMax = max(rightMax, height[r]);
                water += max(0, rightMax - height[r]);
            }
        }
        return water;
    }
};`
    }
  }
];

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ onProceedToSQL }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('rotated-array');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];

  const [code, setCode] = useState<string>(currentProblem.starterCode[language]);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result' | 'coach'>('testcase');

  const [customInput, setCustomInput] = useState<string>(currentProblem.defaultTestCase.input);
  const [customTarget, setCustomTarget] = useState<string>(currentProblem.defaultTestCase.target || '');

  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<CodingEvaluation | null>(null);
  const [aiHint, setAiHint] = useState<AIHintResponse | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [submissionsHistory, setSubmissionsHistory] = useState<Array<{
    id: number;
    problemTitle: string;
    status: string;
    runtime: string;
    memory: string;
    time: string;
    tests: string;
  }>>([]);

  const categories = ['All', 'Arrays & Two Pointers', 'Sliding Window', 'Stacks & Queues', 'Trees & Graphs', 'Dynamic Programming', 'System Design'];

  const filteredProblems = PROBLEMS.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.categoryGroup === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'java' | 'cpp') => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
  };

  const handleProblemChange = (probId: string) => {
    setSelectedProblemId(probId);
    const prob = PROBLEMS.find(p => p.id === probId) || PROBLEMS[0];
    setCode(prob.starterCode[language]);
    setCustomInput(prob.defaultTestCase.input);
    setCustomTarget(prob.defaultTestCase.target || '');
    setResult(null);
    setAiHint(null);
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCode[language]);
    setResult(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const res = await api.submitCode(code, selectedProblemId, language);
      setResult(res);
      setActiveConsoleTab('result');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSubmissionsHistory(prev => [
        {
          id: Date.now(),
          problemTitle: currentProblem.title,
          status: res.passed_tests === res.total_tests ? 'Accepted' : 'Partial / Failed',
          runtime: '34 ms',
          memory: '15.8 MB',
          time: nowStr,
          tests: `${res.passed_tests}/${res.total_tests}`
        },
        ...prev
      ]);

      const score = Math.round((res.passed_tests / res.total_tests) * 100);
      userStore.submitAssessmentResult('coding-assessment', 'technical', score);
    } catch (err) {
      console.error("Code submission error:", err);
    } finally {
      setRunning(false);
    }
  };

  const handleFetchAIHint = async () => {
    setLoadingHint(true);
    try {
      const hintRes = await api.getAIHint(selectedProblemId, code, language);
      setAiHint(hintRes);
      setActiveLeftTab('editorial');
    } catch (err) {
      console.error("Failed to retrieve AI hint:", err);
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] font-sans text-slate-100 flex flex-col">

      {/* TOP NAVBAR */}
      <header className="px-6 py-3.5 bg-[#0D1527] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-wide">CareerForge IDE</span>
              <span className="text-[10px] text-sky-400 block font-mono">FAANG Interview Engine v2.4</span>
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* PROBLEM SELECTOR DROPDOWN */}
          <div className="relative">
            <select
              value={selectedProblemId}
              onChange={(e) => handleProblemChange(e.target.value)}
              className="px-3.5 py-1.5 border border-slate-700/80 rounded-xl bg-[#111A30] text-xs font-bold text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm hover:bg-[#16223F] transition-all"
            >
              {PROBLEMS.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0D1527] text-slate-200 py-1">
                  [{p.difficulty}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            currentProblem.difficulty === 'Easy'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : currentProblem.difficulty === 'Medium'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {currentProblem.difficulty}
          </span>
        </div>

        {/* RIGHT SIDE CONTROLS */}
        <div className="flex items-center space-x-3">
          {/* AI HINT BUTTON */}
          <button
            onClick={handleFetchAIHint}
            disabled={loadingHint}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{loadingHint ? 'Analyzing...' : 'AI Coach Hint'}</span>
          </button>

          {/* LANGUAGE SELECTOR */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-700/80 rounded-xl bg-[#111A30] text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="java">Java 17</option>
            <option value="cpp">C++ 20</option>
          </select>

          {/* RESET CODE */}
          <button
            onClick={handleResetCode}
            className="p-2 border border-slate-700/80 hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* PROCEED TO SQL */}
          <button
            onClick={onProceedToSQL}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center shadow-lg shadow-sky-600/20"
          >
            <span>Proceed to SQL Assessment</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-sky-200" />
          </button>
        </div>
      </header>

      {/* QUICK PATTERN FILTER BAR */}
      <div className="px-6 py-2 bg-[#090F1E] border-b border-slate-800/60 flex items-center justify-between text-xs overflow-x-auto gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center mr-2">
            <Filter className="w-3 h-3 mr-1 text-sky-400" /> Patterns:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative min-w-[200px] hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-8 pr-3 py-1 bg-[#111A30] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <main className="p-4 sm:p-6 max-w-[1720px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">

        {/* LEFT COLUMN: PROBLEM DESCRIPTION, EDITORIAL & SUBMISSIONS */}
        <div className="lg:col-span-5 bg-[#0D1527] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[780px]">
          {/* TABS */}
          <div className="flex items-center border-b border-slate-800 bg-[#090F1E] px-3 text-xs font-semibold">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'description' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Problem ({PROBLEMS.length})</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('editorial')}
              className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'editorial' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Hints & Patterns</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'submissions' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>History ({submissionsHistory.length})</span>
            </button>
          </div>

          {/* TAB 1: PROBLEM DESCRIPTION */}
          {activeLeftTab === 'description' && (
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-sans flex-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                    {currentProblem.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Pattern: {currentProblem.categoryGroup}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{currentProblem.title}</h2>
              </div>

              <div className="space-y-3 leading-relaxed text-slate-300 bg-[#111A30]/50 p-4 rounded-xl border border-slate-800/80">
                <p className="whitespace-pre-line text-[13px]">{currentProblem.description}</p>
              </div>

              {/* EXAMPLES */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Examples
                </h3>
                {currentProblem.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-[#111A30] border border-slate-800 rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Input:</strong> <span className="text-sky-300">{ex.input}</span>
                    </div>
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Output:</strong> <span className="text-emerald-300">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 text-[10px] pt-1.5 border-t border-slate-800">
                        <strong className="text-slate-300 font-sans">Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CONSTRAINTS */}
              <div className="space-y-2 pt-1">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center">
                  <Cpu className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Constraints
                </h3>
                <ul className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-[#111A30]/30 p-4 rounded-xl border border-slate-800/60">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2.5"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: EDITORIAL & AI HINTS */}
          {activeLeftTab === 'editorial' && (
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 font-sans flex-1">
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl text-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs flex items-center text-amber-300">
                    <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" /> Algorithmic Pattern Guidance
                  </h4>
                  <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                    {aiHint?.algorithmic_pattern || currentProblem.categoryGroup}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-amber-100/90">
                  {aiHint?.hint || `This problem evaluates your mastery of ${currentProblem.category}. Break down into edge cases, choose appropriate auxiliary structures, and verify time complexity targets before writing implementation.`}
                </p>
              </div>

              {/* COMPLEXITY TARGETS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#111A30] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold">TARGET RUNTIME</span>
                  <span className="text-sm font-bold text-sky-400 font-mono mt-1 block">
                    {aiHint?.time_complexity_target || (currentProblem.difficulty === 'Easy' ? 'O(N)' : 'O(log N) or O(N)')}
                  </span>
                </div>
                <div className="p-3.5 bg-[#111A30] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-mono font-bold">TARGET SPACE</span>
                  <span className="text-sm font-bold text-indigo-400 font-mono mt-1 block">
                    {aiHint?.space_complexity_target || 'O(1) Auxiliary'}
                  </span>
                </div>
              </div>

              {/* HINT GENERATION TRIGGER */}
              <div className="p-4 bg-[#111A30] border border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Need a hint on your active code?</h4>
                <p className="text-slate-400 text-[11px]">
                  CareerForge AI Code Coach will inspect your syntax, pointer management, and complexity bottlenecks to give targeted hints without spoiling the entire solution.
                </p>
                <button
                  onClick={handleFetchAIHint}
                  disabled={loadingHint}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingHint ? 'Synthesizing Hints...' : 'Request Adaptive Hint'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS HISTORY */}
          {activeLeftTab === 'submissions' && (
            <div className="p-6 overflow-y-auto space-y-3 text-xs flex-1">
              {submissionsHistory.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-sans space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-slate-400">No submissions yet for this session</p>
                  <p className="text-[11px]">Click "Run Code" or "Submit Solution" to track your runtime and benchmarks.</p>
                </div>
              ) : (
                submissionsHistory.map((sub) => (
                  <div key={sub.id} className="p-3.5 bg-[#111A30] border border-slate-800 rounded-xl flex justify-between items-center font-mono">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-xs ${
                          sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-slate-400">({sub.tests})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{sub.problemTitle} • {sub.time}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-300">
                      <div>Runtime: <span className="text-sky-400">{sub.runtime}</span></div>
                      <div className="text-slate-500 text-[10px]">Memory: {sub.memory}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: IDE EDITOR & OUTPUT CONSOLE */}
        <div className="lg:col-span-7 space-y-4">

          {/* IDE EDITOR CONTAINER */}
          <div className="bg-[#0B1120] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[480px]">
            {/* EDITOR TOP HEADER */}
            <div className="px-5 py-3 bg-[#080E1B] border-b border-slate-800/90 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <Code className="w-4 h-4 text-sky-400" />
                <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'java' ? 'java' : 'cpp'}</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active • UTF-8 • {language.toUpperCase()}</span>
              </div>
            </div>

            {/* TEXTAREA WITH LINE NUMBERS */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs text-slate-100">
              {/* LINE NUMBERS GUTTER */}
              <div className="w-12 bg-[#060A14] py-4 text-right pr-3 select-none text-slate-600 font-mono text-xs border-r border-slate-800/80 space-y-1">
                {Array.from({ length: Math.max(18, code.split('\n').length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* CODE TEXTAREA */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-sky-500/30"
              />
            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="px-5 py-3 bg-[#080E1B] border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Auto-syntax evaluation enabled</span>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 text-sky-400 fill-current" />
                  <span>{running ? 'Executing...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-lg shadow-sky-600/30"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONSOLE & TESTCASE PANEL */}
          <div className="bg-[#0D1527] rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4">
            {/* CONSOLE TABS */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 text-xs font-bold">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'testcase' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Interactive Testcases</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'result' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execution Result {result ? `(${result.passed_tests}/${result.total_tests})` : ''}</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab('coach')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'coach' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Review</span>
                </button>
              </div>
            </div>

            {/* TAB 1: INTERACTIVE TESTCASE INPUTS */}
            {activeConsoleTab === 'testcase' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[#111A30] border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Input Array / Value:</div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full bg-[#080E1B] border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  {customTarget && (
                    <div className="pt-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Target Parameter:</div>
                      <input
                        type="text"
                        value={customTarget}
                        onChange={(e) => setCustomTarget(e.target.value)}
                        className="w-full bg-[#080E1B] border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500 mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: EXECUTION RESULT */}
            {activeConsoleTab === 'result' && (
              <div className="space-y-3 text-xs">
                {result ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-emerald-400 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>
                        {result.passed_tests === result.total_tests ? 'Accepted' : 'Partial Tests Passed'} • {result.passed_tests}/{result.total_tests} Test Cases Passed
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
                      <div className="p-3 bg-[#111A30] rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold">RUNTIME</span>
                        <span className="font-bold text-white text-sm mt-0.5 block">34 ms</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Beats 95.8%</span>
                      </div>
                      <div className="p-3 bg-[#111A30] rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold">TIME COMPLEXITY</span>
                        <span className="font-bold text-sky-400 text-sm mt-0.5 block">{result.time_complexity}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Optimal</span>
                      </div>
                      <div className="p-3 bg-[#111A30] rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold">SPACE COMPLEXITY</span>
                        <span className="font-bold text-indigo-400 text-sm mt-0.5 block">{result.space_complexity}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Clean Memory</span>
                      </div>
                    </div>

                    {/* FEEDBACK BLOCK */}
                    <div className="p-3 bg-[#111A30] rounded-xl border border-slate-800 font-sans text-slate-300 text-xs leading-relaxed">
                      <strong className="text-slate-200">Feedback:</strong> {result.feedback}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 font-sans">
                    Run your code to execute testcases and inspect time/space complexity results.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AI CODE REVIEW */}
            {activeConsoleTab === 'coach' && (
              <div className="space-y-3 text-xs">
                {result ? (
                  <div className="p-4 bg-[#111A30] rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Code Quality Rating</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                        {result.code_quality_rating}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[12px]">{result.feedback}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 font-sans">
                    Submit code to receive automated feedback on memory allocation and algorithmic edge cases.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
};
