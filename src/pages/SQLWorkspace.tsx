import React, { useState } from 'react';
import {
  ArrowRight, Play, Database, Table, Zap, Code,
  Sparkles, RefreshCw, Copy, Check, Eye, BookOpen,
  Layers, Filter, Clock, CheckCircle2, AlertCircle,
  HelpCircle, ChevronRight, Hash, FileText
} from 'lucide-react';
import { SQLEvaluation } from '../types';
import { api } from '../services/api';

interface SQLWorkspaceProps {
  onProceedToReadiness: () => void;
}

export interface SQLProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Joins' | 'Aggregations' | 'Window Functions' | 'CTEs' | 'Analytics';
  description: string;
  tables: string[];
  starterSQL: string;
  solutionSQL: string;
  expectedColumns: string[];
  explanation: string;
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: { name: string; type: string; key?: string; desc: string }[];
  sampleRows: Record<string, any>[];
}

const SCHEMA_DATA: Record<string, SchemaTable> = {
  employees: {
    name: 'employees',
    description: 'Internal company staff directory, department mappings, and compensation details.',
    columns: [
      { name: 'employee_id', type: 'INT', key: 'PK', desc: 'Unique identifier for each employee' },
      { name: 'first_name', type: 'VARCHAR(50)', desc: 'Given name' },
      { name: 'last_name', type: 'VARCHAR(50)', desc: 'Family surname' },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Reference to departments.department_id' },
      { name: 'salary', type: 'DECIMAL(10,2)', desc: 'Annual base salary in USD' },
      { name: 'hire_date', type: 'DATE', desc: 'Date joined the company' },
      { name: 'manager_id', type: 'INT', key: 'FK', desc: 'Manager employee_id (NULL for CEO)' }
    ],
    sampleRows: [
      { employee_id: 101, first_name: 'Victoria', last_name: 'Sterling', department_id: 1, salary: 185000.00, hire_date: '2020-03-15', manager_id: null },
      { employee_id: 102, first_name: 'Aarav', last_name: 'Sharma', department_id: 1, salary: 142000.00, hire_date: '2021-06-01', manager_id: 101 },
      { employee_id: 103, first_name: 'Elena', last_name: 'Rostova', department_id: 1, salary: 138500.00, hire_date: '2022-01-10', manager_id: 102 },
      { employee_id: 104, first_name: 'Marcus', last_name: 'Vance', department_id: 1, salary: 129000.00, hire_date: '2022-08-20', manager_id: 102 },
      { employee_id: 105, first_name: 'Sophia', last_name: 'Lin', department_id: 2, salary: 115000.00, hire_date: '2021-11-05', manager_id: 101 }
    ]
  },
  departments: {
    name: 'departments',
    description: 'Corporate organizational units, annual budget allocations, and office locations.',
    columns: [
      { name: 'department_id', type: 'INT', key: 'PK', desc: 'Unique department code' },
      { name: 'department_name', type: 'VARCHAR(100)', desc: 'Formal department title' },
      { name: 'budget', type: 'DECIMAL(12,2)', desc: 'Annual operational budget' },
      { name: 'location', type: 'VARCHAR(100)', desc: 'Primary physical campus / city' }
    ],
    sampleRows: [
      { department_id: 1, department_name: 'Engineering', budget: 4500000.00, location: 'San Francisco, CA' },
      { department_id: 2, department_name: 'Marketing', budget: 1800000.00, location: 'New York, NY' },
      { department_id: 3, department_name: 'Product Design', budget: 1200000.00, location: 'Austin, TX' },
      { department_id: 4, department_name: 'Operations', budget: 2100000.00, location: 'Chicago, IL' }
    ]
  },
  customers: {
    name: 'customers',
    description: 'Registered platform client profiles, geographic regions, and account tier details.',
    columns: [
      { name: 'customer_id', type: 'INT', key: 'PK', desc: 'Unique account identifier' },
      { name: 'customer_name', type: 'VARCHAR(100)', desc: 'Corporate or individual account name' },
      { name: 'email', type: 'VARCHAR(100)', desc: 'Primary contact email' },
      { name: 'city', type: 'VARCHAR(50)', desc: 'Billing city' },
      { name: 'signup_date', type: 'DATE', desc: 'Registration timestamp' }
    ],
    sampleRows: [
      { customer_id: 101, customer_name: 'Acme Corp', email: 'billing@acme.corp', city: 'Seattle', signup_date: '2024-01-10' },
      { customer_id: 102, customer_name: 'Stark Industries', email: 'orders@stark.io', city: 'New York', signup_date: '2024-02-15' },
      { customer_id: 103, customer_name: 'Wayne Enterprises', email: 'procure@wayne.com', city: 'Gotham', signup_date: '2024-03-01' },
      { customer_id: 204, customer_name: 'Apex Logistics', email: 'contact@apexlogistics.io', city: 'Denver', signup_date: '2025-05-12' },
      { customer_id: 209, customer_name: 'Vanguard Labs', email: 'billing@vanguardlabs.com', city: 'Boston', signup_date: '2025-07-22' }
    ]
  },
  orders: {
    name: 'orders',
    description: 'Commercial transactions, order values, delivery statuses, and customer mappings.',
    columns: [
      { name: 'order_id', type: 'INT', key: 'PK', desc: 'Unique order invoice number' },
      { name: 'customer_id', type: 'INT', key: 'FK', desc: 'Purchaser customer_id' },
      { name: 'order_date', type: 'DATETIME', desc: 'Transaction processing timestamp' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', desc: 'Total invoice amount in USD' },
      { name: 'status', type: 'VARCHAR(20)', desc: "Order fulfillment status ('completed', 'pending', 'cancelled')" }
    ],
    sampleRows: [
      { order_id: 1001, customer_id: 101, order_date: '2026-01-15 10:30:00', total_amount: 4200.00, status: 'completed' },
      { order_id: 1005, customer_id: 102, order_date: '2026-01-20 14:15:00', total_amount: 6200.00, status: 'completed' },
      { order_id: 1018, customer_id: 101, order_date: '2026-02-10 11:00:00', total_amount: 5100.00, status: 'completed' },
      { order_id: 1030, customer_id: 102, order_date: '2026-03-05 09:45:00', total_amount: 6000.50, status: 'completed' },
      { order_id: 1042, customer_id: 101, order_date: '2026-03-22 16:20:00', total_amount: 5200.00, status: 'completed' }
    ]
  },
  transactions: {
    name: 'transactions',
    description: 'High-frequency ledger records for payments, fraud velocity monitoring, and settlements.',
    columns: [
      { name: 'txn_id', type: 'BIGINT', key: 'PK', desc: 'Unique ledger reference' },
      { name: 'account_id', type: 'INT', key: 'FK', desc: 'Associated merchant account' },
      { name: 'txn_timestamp', type: 'DATETIME', desc: 'Precise microsecond timestamp' },
      { name: 'amount', type: 'DECIMAL(12,2)', desc: 'Cleared settlement amount' },
      { name: 'txn_type', type: 'VARCHAR(30)', desc: 'Wire, ACH, Card, Refund' }
    ],
    sampleRows: [
      { txn_id: 9001, account_id: 501, txn_timestamp: '2026-04-01 08:12:04', amount: 1450.00, txn_type: 'Card' },
      { txn_id: 9002, account_id: 501, txn_timestamp: '2026-04-01 08:14:22', amount: 3200.00, txn_type: 'Card' },
      { txn_id: 9003, account_id: 504, txn_timestamp: '2026-04-01 08:30:15', amount: 980.50, txn_type: 'ACH' },
      { txn_id: 9004, account_id: 508, txn_timestamp: '2026-04-01 09:05:40', amount: 8400.00, txn_type: 'Wire' }
    ]
  }
};

const SQL_PROBLEMS: SQLProblem[] = [
  // EASY (1-4)
  {
    id: 'p1',
    title: '1. Top 5 High Earners in Engineering',
    difficulty: 'Easy',
    category: 'Aggregations',
    description: 'Write a query to retrieve the top 5 highest-paid employees in the Engineering department (department_id = 1). Return their first_name, last_name, and salary ordered from highest to lowest salary.',
    tables: ['employees'],
    starterSQL: `SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1
ORDER BY salary DESC
LIMIT 5;`,
    solutionSQL: `SELECT first_name, last_name, salary
FROM employees
WHERE department_id = 1
ORDER BY salary DESC
LIMIT 5;`,
    expectedColumns: ['first_name', 'last_name', 'salary'],
    explanation: 'Simple filtering with WHERE, descending sorting with ORDER BY salary DESC, and bounding result buffer size with LIMIT 5.'
  },
  {
    id: 'p2',
    title: '2. Customers Without Any Orders',
    difficulty: 'Easy',
    category: 'Joins',
    description: 'Identify all registered customers who have never placed an order in the system. Return customer_id, customer_name, and email to assist marketing outreach.',
    tables: ['customers', 'orders'],
    starterSQL: `SELECT c.customer_id, c.customer_name, c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
    solutionSQL: `SELECT c.customer_id, c.customer_name, c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
    expectedColumns: ['customer_id', 'customer_name', 'email'],
    explanation: 'Demonstrates the canonical Anti-Join pattern using LEFT JOIN and filtering WHERE foreign_key IS NULL, which is significantly faster and safer than NOT IN with nullable keys.'
  },
  {
    id: 'p3',
    title: '3. Duplicate Email Account Detection',
    difficulty: 'Easy',
    category: 'Aggregations',
    description: 'Detect any email addresses that are linked to multiple customer records. Return email and the count of accounts sharing that address, sorted by account_count descending.',
    tables: ['customers'],
    starterSQL: `SELECT email, COUNT(*) AS account_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY account_count DESC;`,
    solutionSQL: `SELECT email, COUNT(*) AS account_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY account_count DESC;`,
    expectedColumns: ['email', 'account_count'],
    explanation: 'GROUP BY aggregates records per key, while HAVING COUNT(*) > 1 filters post-aggregation groups without needing a subquery.'
  },
  {
    id: 'p4',
    title: '4. Monthly Order Volume & Revenue',
    difficulty: 'Easy',
    category: 'Analytics',
    description: "Calculate total revenue and the number of completed orders per month for the year 2026. Format the month as 'YYYY-MM' and order chronologically.",
    tables: ['orders'],
    starterSQL: `SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS order_month,
    COUNT(order_id) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY order_month ASC;`,
    solutionSQL: `SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS order_month,
    COUNT(order_id) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY order_month ASC;`,
    expectedColumns: ['order_month', 'order_count', 'total_revenue'],
    explanation: 'Combines date truncation/formatting with multi-aggregate functions (COUNT and SUM) and filtered index evaluation.'
  },

  // MEDIUM (5-9)
  {
    id: 'p5',
    title: '5. Multi-Table JOIN & Customer Total Spend',
    difficulty: 'Medium',
    category: 'Joins',
    description: 'Find the top 5 highest-spending customers across all completed orders. Return customer_id, customer_name, and their total_spent, ordered from highest spender to lowest.',
    tables: ['customers', 'orders'],
    starterSQL: `SELECT 
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.customer_name
ORDER BY total_spent DESC
LIMIT 5;`,
    solutionSQL: `SELECT 
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.customer_name
ORDER BY total_spent DESC
LIMIT 5;`,
    expectedColumns: ['customer_id', 'customer_name', 'total_spent'],
    explanation: 'Uses INNER JOIN between customer master and orders fact table, grouping by candidate key and calculating sum aggregation.'
  },
  {
    id: 'p6',
    title: '6. Department Top 3 Salaries (DENSE_RANK)',
    difficulty: 'Medium',
    category: 'Window Functions',
    description: 'Find employees who earn one of the top 3 unique salaries within each department using DENSE_RANK(). Return department_name, employee_name, salary, and salary_rank.',
    tables: ['employees', 'departments'],
    starterSQL: `WITH RankedSalaries AS (
    SELECT 
        d.department_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id 
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM employees e
    JOIN departments d ON e.department_id = d.department_id
)
SELECT department_name, employee_name, salary, salary_rank
FROM RankedSalaries
WHERE salary_rank <= 3
ORDER BY department_name, salary_rank;`,
    solutionSQL: `WITH RankedSalaries AS (
    SELECT 
        d.department_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id 
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM employees e
    JOIN departments d ON e.department_id = d.department_id
)
SELECT department_name, employee_name, salary, salary_rank
FROM RankedSalaries
WHERE salary_rank <= 3
ORDER BY department_name, salary_rank;`,
    expectedColumns: ['department_name', 'employee_name', 'salary', 'salary_rank'],
    explanation: 'A staple senior interview problem. DENSE_RANK() ensures that salary ties receive the same rank without creating gaps in ranking sequence.'
  },
  {
    id: 'p7',
    title: '7. Month-over-Month Revenue Growth (LAG)',
    difficulty: 'Medium',
    category: 'Window Functions',
    description: "Calculate month-over-month (MoM) revenue growth percentage for completed orders in 2026. Use LAG() to fetch the previous month's revenue and calculate mom_growth_pct.",
    tables: ['orders'],
    starterSQL: `WITH MonthlyRevenue AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS sales_month,
        SUM(total_amount) AS current_revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY sales_month
)
SELECT 
    sales_month,
    current_revenue,
    LAG(current_revenue, 1) OVER (ORDER BY sales_month) AS prev_revenue,
    ROUND(
        ((current_revenue - LAG(current_revenue, 1) OVER (ORDER BY sales_month)) 
        / LAG(current_revenue, 1) OVER (ORDER BY sales_month)) * 100, 
        2
    ) AS mom_growth_pct
FROM MonthlyRevenue;`,
    solutionSQL: `WITH MonthlyRevenue AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS sales_month,
        SUM(total_amount) AS current_revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY sales_month
)
SELECT 
    sales_month,
    current_revenue,
    LAG(current_revenue, 1) OVER (ORDER BY sales_month) AS prev_revenue,
    ROUND(
        ((current_revenue - LAG(current_revenue, 1) OVER (ORDER BY sales_month)) 
        / LAG(current_revenue, 1) OVER (ORDER BY sales_month)) * 100, 
        2
    ) AS mom_growth_pct
FROM MonthlyRevenue;`,
    expectedColumns: ['sales_month', 'current_revenue', 'prev_revenue', 'mom_growth_pct'],
    explanation: 'Evaluates analytical windowing over pre-aggregated CTE results. LAG() inspects the preceding record in the ordered stream.'
  },
  {
    id: 'p8',
    title: '8. Cumulative Running Total per Customer',
    difficulty: 'Medium',
    category: 'Window Functions',
    description: 'For each customer, calculate a cumulative running total of their order spending over time. Return customer_name, order_id, order_date, total_amount, and running_total.',
    tables: ['customers', 'orders'],
    starterSQL: `SELECT 
    c.customer_name,
    o.order_id,
    o.order_date,
    o.total_amount,
    SUM(o.total_amount) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.customer_name, o.order_date;`,
    solutionSQL: `SELECT 
    c.customer_name,
    o.order_id,
    o.order_date,
    o.total_amount,
    SUM(o.total_amount) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.customer_name, o.order_date;`,
    expectedColumns: ['customer_name', 'order_id', 'order_date', 'total_amount', 'running_total'],
    explanation: 'Explicit window frame declaration (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) ensures deterministic linear scan performance.'
  },
  {
    id: 'p9',
    title: '9. Above Average Earners within Department',
    difficulty: 'Medium',
    category: 'CTEs',
    description: 'Find all employees whose salary exceeds the average salary of their respective department. Return employee_name, department_name, salary, and the department average salary.',
    tables: ['employees', 'departments'],
    starterSQL: `SELECT 
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    d.department_name,
    e.salary,
    ROUND(dept_avg.avg_salary, 2) AS dept_avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) dept_avg ON e.department_id = dept_avg.department_id
WHERE e.salary > dept_avg.avg_salary
ORDER BY d.department_name, e.salary DESC;`,
    solutionSQL: `SELECT 
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    d.department_name,
    e.salary,
    ROUND(dept_avg.avg_salary, 2) AS dept_avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) dept_avg ON e.department_id = dept_avg.department_id
WHERE e.salary > dept_avg.avg_salary
ORDER BY d.department_name, e.salary DESC;`,
    expectedColumns: ['employee_name', 'department_name', 'salary', 'dept_avg_salary'],
    explanation: 'Demonstrates joining derived tables/aggregates back to base tables, or alternatively using windowed AVG() OVER (PARTITION BY department_id).'
  },

  // HARD (10-12)
  {
    id: 'p10',
    title: '10. Consecutive Month Customer Retention',
    difficulty: 'Hard',
    category: 'Analytics',
    description: 'Identify repeat customers who placed at least one completed order in consecutive calendar months. Return customer_id, customer_name, current_month, and next_month.',
    tables: ['customers', 'orders'],
    starterSQL: `WITH CustomerMonths AS (
    SELECT DISTINCT 
        customer_id, 
        DATE_FORMAT(order_date, '%Y-%m') AS order_month
    FROM orders
    WHERE status = 'completed'
),
ChainedMonths AS (
    SELECT 
        customer_id,
        order_month AS current_month,
        LEAD(order_month) OVER (
            PARTITION BY customer_id 
            ORDER BY order_month
        ) AS next_month
    FROM CustomerMonths
)
SELECT 
    c.customer_id,
    c.customer_name,
    cm.current_month,
    cm.next_month
FROM ChainedMonths cm
JOIN customers c ON cm.customer_id = c.customer_id
WHERE PERIOD_DIFF(
    REPLACE(cm.next_month, '-', ''), 
    REPLACE(cm.current_month, '-', '')
) = 1;`,
    solutionSQL: `WITH CustomerMonths AS (
    SELECT DISTINCT 
        customer_id, 
        DATE_FORMAT(order_date, '%Y-%m') AS order_month
    FROM orders
    WHERE status = 'completed'
),
ChainedMonths AS (
    SELECT 
        customer_id,
        order_month AS current_month,
        LEAD(order_month) OVER (
            PARTITION BY customer_id 
            ORDER BY order_month
        ) AS next_month
    FROM CustomerMonths
)
SELECT 
    c.customer_id,
    c.customer_name,
    cm.current_month,
    cm.next_month
FROM ChainedMonths cm
JOIN customers c ON cm.customer_id = c.customer_id
WHERE PERIOD_DIFF(
    REPLACE(cm.next_month, '-', ''), 
    REPLACE(cm.current_month, '-', '')
) = 1;`,
    expectedColumns: ['customer_id', 'customer_name', 'current_month', 'next_month'],
    explanation: 'Cohort retention analysis using LEAD() over distinct active periods and delta calculation between months.'
  },
  {
    id: 'p11',
    title: '11. Hierarchical Reporting Tree (WITH RECURSIVE)',
    difficulty: 'Hard',
    category: 'CTEs',
    description: 'Construct the complete employee-manager reporting tree starting from executive leadership (manager_id IS NULL) down to all hierarchy levels using WITH RECURSIVE.',
    tables: ['employees'],
    starterSQL: `WITH RECURSIVE OrgHierarchy AS (
    -- Anchor member: CEO / top executive
    SELECT 
        employee_id,
        CONCAT(first_name, ' ', last_name) AS employee_name,
        manager_id,
        CAST(NULL AS CHAR(100)) AS manager_name,
        1 AS hierarchy_level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive member: Subordinates
    SELECT 
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.manager_id,
        h.employee_name AS manager_name,
        h.hierarchy_level + 1 AS hierarchy_level
    FROM employees e
    INNER JOIN OrgHierarchy h ON e.manager_id = h.employee_id
)
SELECT employee_name, manager_name, hierarchy_level
FROM OrgHierarchy
ORDER BY hierarchy_level, employee_name;`,
    solutionSQL: `WITH RECURSIVE OrgHierarchy AS (
    SELECT 
        employee_id,
        CONCAT(first_name, ' ', last_name) AS employee_name,
        manager_id,
        CAST(NULL AS CHAR(100)) AS manager_name,
        1 AS hierarchy_level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT 
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.manager_id,
        h.employee_name AS manager_name,
        h.hierarchy_level + 1 AS hierarchy_level
    FROM employees e
    INNER JOIN OrgHierarchy h ON e.manager_id = h.employee_id
)
SELECT employee_name, manager_name, hierarchy_level
FROM OrgHierarchy
ORDER BY hierarchy_level, employee_name;`,
    expectedColumns: ['employee_name', 'manager_name', 'hierarchy_level'],
    explanation: 'A top FAANG interview question testing recursive CTE graph traversal, base condition anchoring, and loop safety.'
  },
  {
    id: 'p12',
    title: '12. Customer LTV Decile Segmentation (NTILE)',
    difficulty: 'Hard',
    category: 'Analytics',
    description: 'Segment all active customers into 10 spending deciles (1 = top 10% highest spenders, 10 = lowest) using NTILE(10). Return decile_rank, customer_count, min_spend, and avg_spend.',
    tables: ['customers', 'orders'],
    starterSQL: `WITH CustomerTotalSpend AS (
    SELECT 
        c.customer_id,
        SUM(o.total_amount) AS total_spend,
        NTILE(10) OVER (ORDER BY SUM(o.total_amount) DESC) AS decile_rank
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
)
SELECT 
    decile_rank,
    COUNT(customer_id) AS customer_count,
    ROUND(MIN(total_spend), 2) AS min_spend,
    ROUND(AVG(total_spend), 2) AS avg_spend
FROM CustomerTotalSpend
GROUP BY decile_rank
ORDER BY decile_rank ASC;`,
    solutionSQL: `WITH CustomerTotalSpend AS (
    SELECT 
        c.customer_id,
        SUM(o.total_amount) AS total_spend,
        NTILE(10) OVER (ORDER BY SUM(o.total_amount) DESC) AS decile_rank
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
)
SELECT 
    decile_rank,
    COUNT(customer_id) AS customer_count,
    ROUND(MIN(total_spend), 2) AS min_spend,
    ROUND(AVG(total_spend), 2) AS avg_spend
FROM CustomerTotalSpend
GROUP BY decile_rank
ORDER BY decile_rank ASC;`,
    expectedColumns: ['decile_rank', 'customer_count', 'min_spend', 'avg_spend'],
    explanation: 'Applies statistical bucket partition with NTILE() followed by group-level metric summaries per decile tier.'
  }
];

export const SQLWorkspace: React.FC<SQLWorkspaceProps> = ({ onProceedToReadiness }) => {
  // Current selected problem
  const [selectedProblemId, setSelectedProblemId] = useState<string>('p5');
  const activeProblem = SQL_PROBLEMS.find(p => p.id === selectedProblemId) || SQL_PROBLEMS[4];

  // Editor and execution state
  const [query, setQuery] = useState<string>(activeProblem.starterSQL);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<SQLEvaluation | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Schema Explorer view state
  const [activeSchemaTable, setActiveSchemaTable] = useState<string>('customers');
  const [schemaTabMode, setSchemaTabMode] = useState<'columns' | 'sample'>('columns');

  // Switch problem
  const handleSelectProblem = (prob: SQLProblem) => {
    setSelectedProblemId(prob.id);
    setQuery(prob.starterSQL);
    setResult(null);
    setShowSolution(false);
    if (prob.tables.length > 0) {
      setActiveSchemaTable(prob.tables[0]);
    }
  };

  // Execute SQL
  const handleExecute = async () => {
    if (!query.trim() || executing) return;
    setExecuting(true);
    try {
      const res = await api.submitSQL(query, activeProblem.id);
      setResult(res);
      if (res.correctness_score >= 0.8 && !solvedProblemIds.includes(activeProblem.id)) {
        setSolvedProblemIds(prev => [...prev, activeProblem.id]);
      }
    } catch (err) {
      console.error("SQL execution failed:", err);
    } finally {
      setExecuting(false);
    }
  };

  // Reset starter SQL
  const handleResetStarter = () => {
    setQuery(activeProblem.starterSQL);
    setResult(null);
    setShowSolution(false);
  };

  // Copy query to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter problems
  const filteredProblems = SQL_PROBLEMS.filter(p => {
    const diffMatch = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const catMatch = categoryFilter === 'All' || p.category === categoryFilter;
    return diffMatch && catMatch;
  });

  const categories = ['All', 'Joins', 'Aggregations', 'Window Functions', 'CTEs', 'Analytics'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans text-[#0A192F]">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] mb-1">
            <span className="flex items-center text-sky-600">
              <Database className="w-3.5 h-3.5 mr-1" />
              DATABASE SYSTEM ASSESSMENT
            </span>
            <span>•</span>
            <span>Relational Query Engineering & Optimization</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center">
            SQL Query Lab & Performance Sandbox
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {solvedProblemIds.length} of {SQL_PROBLEMS.length} Solved
            </span>
          </h1>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Practice multi-table JOINs, window functions (RANK, LAG, NTILE), CTEs, and index optimization tips with realistic enterprise datasets.
          </p>
        </div>

        <button
          onClick={onProceedToReadiness}
          className="px-5 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold transition-all flex items-center shadow-sm"
        >
          View Readiness Score <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

      {/* FILTER CONTROLS & STATS BAR */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Difficulty buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-xs font-bold text-[#64748B] flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" /> Difficulty:
          </span>
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                difficultyFilter === diff
                  ? 'bg-[#0A192F] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Category buttons */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-xs font-bold text-[#64748B] mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PROBLEM SELECTOR TABS CAROUSEL */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {filteredProblems.map((prob) => {
          const isSelected = prob.id === selectedProblemId;
          const isSolved = solvedProblemIds.includes(prob.id);

          return (
            <button
              key={prob.id}
              onClick={() => handleSelectProblem(prob)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-[#0A192F] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  prob.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : prob.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {prob.difficulty}
                </span>

                {isSolved && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-xs font-bold mt-1 line-clamp-1 max-w-[200px]">
                {prob.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT (PROBLEM & SCHEMA) | RIGHT (CODE EDITOR & RESULTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: PROBLEM DESCRIPTION & INTERACTIVE SCHEMA EXPLORER (5 COLS)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">

          {/* ACTIVE PROBLEM BRIEF */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wide">
                  {activeProblem.category} Challenge
                </span>
                <h2 className="text-lg font-extrabold text-[#0A192F] mt-0.5">
                  {activeProblem.title}
                </h2>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                activeProblem.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeProblem.difficulty === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activeProblem.difficulty}
              </span>
            </div>

            <div className="text-xs text-[#475569] leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {activeProblem.description}
            </div>

            {/* Relevant Tables Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold block">
                Target Schema Tables:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProblem.tables.map(tbl => (
                  <button
                    key={tbl}
                    onClick={() => setActiveSchemaTable(tbl)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      activeSchemaTable === tbl
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>{tbl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Output Column Badges */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold block">
                Required Output Columns:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProblem.expectedColumns.map(col => (
                  <span
                    key={col}
                    className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Toggle Solution Guide */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showSolution ? 'Hide Gold Standard Solution' : 'View Reference Solution & Logic'}</span>
              </button>

              {showSolution && (
                <div className="mt-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-950">
                  <div className="font-bold flex items-center space-x-1 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Solution Explanation:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] font-medium text-amber-900">
                    {activeProblem.explanation}
                  </p>
                  <pre className="p-3 bg-[#0A192F] text-[#FFDE59] rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
                    {activeProblem.solutionSQL}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* INTERACTIVE SCHEMA & SAMPLE DATA EXPLORER */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-extrabold text-[#0A192F]">Interactive Schema Explorer</span>
              </div>

              {/* Toggle Mode: Columns vs Sample Rows */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setSchemaTabMode('columns')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    schemaTabMode === 'columns'
                      ? 'bg-white text-[#0A192F] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Columns
                </button>
                <button
                  type="button"
                  onClick={() => setSchemaTabMode('sample')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    schemaTabMode === 'sample'
                      ? 'bg-white text-[#0A192F] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sample Data
                </button>
              </div>
            </div>

            {/* Table Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(SCHEMA_DATA).map(tableName => (
                <button
                  key={tableName}
                  onClick={() => setActiveSchemaTable(tableName)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeSchemaTable === tableName
                      ? 'bg-[#0A192F] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
                  }`}
                >
                  {tableName}
                </button>
              ))}
            </div>

            {/* Active Table Details */}
            {SCHEMA_DATA[activeSchemaTable] && (
              <div className="space-y-3">
                <div className="text-xs text-[#64748B] font-medium leading-relaxed">
                  {SCHEMA_DATA[activeSchemaTable].description}
                </div>

                {schemaTabMode === 'columns' ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="p-2.5 font-bold">Column</th>
                          <th className="p-2.5 font-bold">Type</th>
                          <th className="p-2.5 font-bold">Key</th>
                          <th className="p-2.5 font-bold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SCHEMA_DATA[activeSchemaTable].columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-[#0A192F]">{col.name}</td>
                            <td className="p-2.5 text-sky-700 font-semibold">{col.type}</td>
                            <td className="p-2.5">
                              {col.key ? (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  col.key === 'PK' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {col.key}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-2.5 font-sans text-xs text-slate-500">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          {SCHEMA_DATA[activeSchemaTable].columns.map(c => (
                            <th key={c.name} className="p-2.5 font-bold whitespace-nowrap">{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SCHEMA_DATA[activeSchemaTable].sampleRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            {SCHEMA_DATA[activeSchemaTable].columns.map(c => (
                              <td key={c.name} className="p-2.5 text-slate-700 whitespace-nowrap">
                                {row[c.name] === null ? (
                                  <span className="text-rose-400 italic">NULL</span>
                                ) : (
                                  String(row[c.name])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: CODE EDITOR & QUERY EXECUTION RESULTS (7 COLS)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">

          {/* CODE EDITOR BOX */}
          <div className="bg-[#0A192F] rounded-3xl overflow-hidden border border-slate-800 shadow-xl space-y-0">
            {/* Editor Header */}
            <div className="px-5 py-3 bg-[#112240] border-b border-slate-800 flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2 font-mono text-slate-300">
                <Code className="w-4 h-4 text-sky-400" />
                <span className="font-bold">workspace.sql</span>
                <span className="text-slate-500 text-[11px]">({activeProblem.difficulty})</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetStarter}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors flex items-center"
                  title="Reset to Starter SQL"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors flex items-center"
                  title="Copy Query"
                >
                  {copied ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleExecute}
                  disabled={executing || !query.trim()}
                  className="px-4 py-1.5 bg-[#427AB5] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current text-amber-300" />
                  {executing ? 'Executing...' : 'Run Query'}
                </button>
              </div>
            </div>

            {/* Quick Syntax Snippets */}
            <div className="px-5 py-2 bg-[#0C1E38] border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px] font-mono text-slate-300">
              <span className="text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">Snippets:</span>
              <button
                onClick={() => setQuery(prev => prev + '\nINNER JOIN orders o ON c.customer_id = o.customer_id')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 whitespace-nowrap"
              >
                + INNER JOIN
              </button>
              <button
                onClick={() => setQuery(prev => prev + '\nDENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 whitespace-nowrap"
              >
                + DENSE_RANK()
              </button>
              <button
                onClick={() => setQuery(prev => prev + '\nLAG(total_amount, 1) OVER (ORDER BY order_date)')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 whitespace-nowrap"
              >
                + LAG()
              </button>
              <button
                onClick={() => setQuery(prev => prev + '\nGROUP BY customer_id\nHAVING COUNT(*) > 1')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 whitespace-nowrap"
              >
                + HAVING
              </button>
            </div>

            {/* SQL Textarea */}
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleExecute();
                }
              }}
              rows={11}
              placeholder="Write your standard SQL query here... (Press Ctrl+Enter to execute)"
              className="w-full p-5 bg-[#0A192F] text-[#FFDE59] font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-slate-700"
            />
          </div>

          {/* EXECUTION OUTPUT RESULTS */}
          {result && (
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-[#0A192F]">Execution Results</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    result.correctness_score >= 0.8
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {result.correctness_score >= 0.8 ? '🟢 Query Passed' : '🟡 Needs Optimization'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-slate-500">
                    Rows: <strong className="text-[#0A192F]">{result.result_rows.length}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {result.execution_time_ms} ms
                  </span>
                </div>
              </div>

              {/* Feedback Alert */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                result.correctness_score >= 0.8
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execution Analysis:</span>
                </div>
                <p className="font-medium">{result.feedback}</p>
              </div>

              {/* Optimization Tips */}
              {result.optimization_tips && result.optimization_tips.length > 0 && (
                <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-sky-800 uppercase font-bold flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1 text-sky-600" /> Indexing & Performance Recommendations:
                  </span>
                  <ul className="space-y-1 text-sky-950">
                    {result.optimization_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0"></span>
                        <span className="font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Returned Table Rows */}
              {result.result_rows && result.result_rows.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        {Object.keys(result.result_rows[0]).map((colKey) => (
                          <th key={colKey} className="p-3 font-bold whitespace-nowrap">
                            {colKey}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.result_rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          {Object.keys(result.result_rows[0]).map((colKey) => {
                            const val = row[colKey];
                            const isNumeric = typeof val === 'number';
                            return (
                              <td
                                key={colKey}
                                className={`p-3 whitespace-nowrap ${
                                  isNumeric ? 'text-emerald-700 font-bold' : 'text-[#0A192F]'
                                }`}
                              >
                                {val === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : isNumeric && colKey.includes('spent') || colKey.includes('salary') || colKey.includes('revenue') ? (
                                  `$${val.toLocaleString()}`
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No records returned or query resulted in 0 matching rows.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
