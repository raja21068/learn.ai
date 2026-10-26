# Databases: experiments, a realistic project, personalised explanations, evidence of understanding

**Date:** 2026-10-24. The same layer that earlier phases added to AI Agents, Machine Learning, LLM Engineering and Prompt Engineering, now for Databases. This is the first course whose labs are SQL, so it differs in two ways: the experiment runs on the **real SQLite engine** that the site already loads (not a toy model), and the project is graded by inspecting what the database contains afterwards.

## What was added

### 1. An experiment: the Index Lab (`index-lab.js`, lesson "Experiment: which indexes does SQLite actually use?")
A generated table of 4,000 orders and 500 customers is queried eight ways (a point lookup, a quarter of the table, a range, a function wrapped around the column, filter-plus-sort, a leading-wildcard LIKE, a covering lookup, and a join). The learner ticks which of eight indexes to create, and the lab shows SQLite's own `EXPLAIN QUERY PLAN` for every query, how many rows it returns, and what each extra index costs on writes. The data come from arithmetic, so the same indexes always give the same plans. Designs are judged by the shape of the plan, never by timing, because timing is not repeatable.
- **What it shows, on the real engine:** an index on `(status, region)` is used for a query that filters `region` then `status`, but the rows still need a temporary-b-tree sort, while `(region, status, created)` removes the sort; a function on the column, and `LIKE '%x%'`, always scan; a `(customer_id, total)` index lets two queries be answered from the index alone; and an index that merely walks the whole index in order (`SCAN ... USING INDEX`) is still a full read, which the lab counts as a scan.
- **The goal** (at most 3 indexes, no sorting, at most 3 queries that read the whole orders table) is met by exactly **6 of the 256 possible designs**, and every one of them includes the three-column index. A predict-first prompt gates the widget.
- **A bug the exhaustive check caught:** my first classifier treated `SCAN orders USING INDEX` as not a scan, so a design with a single index on `created` appeared to meet the goal. Enumerating all 256 designs exposed it, and the classifier was corrected before anything was built on it.
- **A 3-task SQL lab** on the seed database: create an index and check it by inspecting `pragma_index_list`, build a composite index whose column order is checked, and read a real plan after creating an index.

### 2. A realistic project: "A booking database that defends itself" (Part 6, 60 minutes, 5 milestones)
For a climbing gym: (1) a schema with keys, NOT NULL, UNIQUE, CHECK and foreign keys, checked by inspecting the structure; (2) loading the data, parents before children; (3) guarded inserts that book a seat only if one remains; (4) an occupancy report with a LEFT JOIN, GROUP BY and a HAVING on an aggregate; (5) an index plus an audit trigger that logs a cancelled booking, checked by the contents of the log. Each milestone starts from the previous one, which is given in the editor.

### 3. Personalised explanations (`db-coach.js`)
All 20 lessons have the "Explain it differently" panel (analogy, worked example, common mistake, stretch question), recommended from the learner's own quiz tries, hint use and prediction record.

### 4. Evidence of understanding (`db-evidence.js`, `#/evidence/databases`)
Per course part: first-try quiz answers, labs solved without hints, prediction accuracy, **8 new situations** (all six parts covered, none repeating a quiz question) and **6 written teach-backs** checked against a keyword rubric. Records are stored under `databases:<part>` keys, separate from the other courses.

### 5. Hints and quizzes
The hint generator gained a rule that masks the column list of `CREATE INDEX`, because otherwise hint 3 would have shown the complete solution of the index tasks (the content test caught this class of problem). The four new quiz questions meet the guessing guard, which now covers 274 questions in seven courses.

## Verification (run on 2026-10-24)

| Check | Result |
|---|---|
| `python tests/db-labs.py` | pass: all 8 SQL tasks on the real in-browser SQLite with the lab's own grading rules; every solution produces a result and no starter passes |
| `python tests/db-experience.py` | pass: Index Lab locked behind its prediction, real plans (composite order, sargability, covering, goal, index budget), coach, evidence page and export, no mixing with the other courses, 390 px width, zero JS exceptions |
| `node tests/db-coach-evidence.test.cjs` | pass: 20 lessons x 4 explanations, 8 situations (correct option never the longest), 6 rubrics, summary arithmetic, separate storage keys |
| `node tests/content-bank.test.cjs`, `quiz-guessability.test.cjs` | pass: 174 lab tasks with three-stage hints, 274 quiz questions guarded |
| All earlier suites | pass; the regression renders 12 courses and 157 lessons |

Three older browser tests briefly failed because they used Databases as an example of "a course without a coach panel / evidence page", which stopped being true; they now use AI Foundations.

## Honest limits
- **The plans are real, but only for this engine and size.** SQLite 3.44 (sql.js 1.10.3) plans 4,000 generated rows. Other databases, bigger tables, real statistics (`ANALYZE`) and different data can plan differently. The lab teaches how to read a plan and what each index costs, not how fast a real system will be.
- The goal is met by only 6 of 256 designs, all containing the same three-column index, so it rewards one idea and leaves little room for other good answers.
- **The SQL checks inspect the final state, not the route.** A hard-coded `INSERT` passes the guarded-booking milestone just as a real guard does, and a guarded insert is not a complete answer to two people booking at the same instant (that needs transactions). The lesson text says so.
- The Index Lab needs the same SQLite download as the SQL labs (from a CDN), so it needs a network connection.
- The teach-back check matches words, not reasoning, and personalisation chooses which of four fixed texts you see.
- Only the Index Lab has a predict-first prompt in this course; the other 11 widgets do not.
- Answer keys are visible in the page source, and nothing has been tried with real learners.
- The deep layer now exists for five courses. AI Foundations and Deep Learning do not have it yet.
