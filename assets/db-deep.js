/* Two additional Databases lessons: an experiment (Part 4, advanced concepts) and a capstone project (Part 6). Generated from the SQL lab
   definitions that were verified against SQLite; the experiment's engine lives in index-lab.js. */
(() => {
  'use strict';
  const C = window.DB_COURSE; if (!C || C.__deep) return; C.__deep = true;
  const LAB = {
 "id": "index-lab",
 "part": 3,
 "chapter": "Experiment lab",
 "title": "Experiment: which indexes does SQLite actually use?",
 "minutes": 20,
 "goal": "Create indexes on real SQLite, read the query plans, and learn why column order, selectivity and the way a condition is written decide whether an index helps.",
 "sections": [
  {
   "h": "An index is a sorted copy",
   "html": "<p>An <b>index</b> is a second, sorted structure that SQLite keeps next to a table. A <b>SEARCH</b> in a query plan means SQLite jumps into that structure and reads only the matching rows. A <b>SCAN</b> means it reads every row. A <b>covering index</b> contains every column the query needs, so the table is never touched. An <b>ORDER BY</b> that an index cannot satisfy needs a <b>temporary b-tree</b> to sort the rows. Every index also has to be updated by every INSERT, UPDATE and DELETE, so indexes are not free.</p>"
  },
  {
   "h": "Run it like an experiment",
   "html": "<ol><li><b>Predict</b> the plan before you tick a box.</li><li><b>Add one index at a time</b> and watch which queries change. The lab runs the real <code>EXPLAIN QUERY PLAN</code> every time.</li><li><b>Read the plan line by line</b>: SCAN or SEARCH, which index, which columns, COVERING or not, and any temporary b-tree.</li><li><b>Look at how many rows come back.</b> An index pays off when the condition keeps few rows. A condition that keeps a quarter of the table still uses an index, but gains little.</li><li><b>Notice what an index can not help:</b> a function wrapped around the column, or a LIKE that starts with a wildcard.</li><li><b>Count your indexes.</b> The goal limits them because each one slows every write.</li></ol>"
  },
  {
   "h": "What this lab leaves out",
   "html": "<p>The lab uses 4,000 generated orders and judges designs by the <i>shape of the plan</i>, never by timing, because timing is not repeatable. Real tables are bigger, real planners use statistics gathered with ANALYZE, and other databases offer more index types and different planners. What carries over is the method: read the plan, check how selective the condition is, mind the column order, and weigh the cost of writes.</p>"
  }
 ],
 "widget": "indexlab",
 "terms": [
  [
   "Query plan",
   "The description of how the database will run a query, shown by EXPLAIN QUERY PLAN."
  ],
  [
   "Covering index",
   "An index that contains every column a query needs, so the table itself is never read."
  ],
  [
   "Sargable",
   "Written so that an index can be used, for example a column compared directly with a value rather than wrapped in a function."
  ],
  [
   "Composite index",
   "An index on several columns, sorted by the first column, then by the second within it, and so on."
  ]
 ],
 "lab": {
  "intro": "These tasks run on the same SQLite as the experiment. Each run uses a fresh copy of the database, and some tasks are checked by inspecting the indexes you created.",
  "tasks": [
   {
    "prompt": "SQLite does not create an index for a foreign key. Create an index on <code>INVOICE</code> so that finding all the invoices of one customer does not have to read the whole table.",
    "starter": "-- Write your CREATE INDEX statement here\n",
    "solution": "CREATE INDEX idx_invoice_cus ON INVOICE(CUS_CODE);",
    "check": "SELECT COUNT(*) AS indexes_led_by_cus_code FROM pragma_index_list('INVOICE') il WHERE il.origin = 'c' AND (SELECT name FROM pragma_index_info(il.name) WHERE seqno = 0) = 'CUS_CODE';"
   },
   {
    "prompt": "The query <code>SELECT P_CODE, LINE_UNITS FROM LINE WHERE P_CODE = 'HM-100' AND LINE_UNITS &gt;= 5</code> runs thousands of times a day. Create <b>one</b> index on <code>LINE</code> that lets SQLite find the rows by product code, narrow them by units <i>inside the index</i>, and answer from the index alone. The order of the columns matters.",
    "starter": "-- Write your CREATE INDEX statement here\n",
    "solution": "CREATE INDEX idx_line_p_units ON LINE(P_CODE, LINE_UNITS);",
    "check": "SELECT ii.name AS column_in_index_order FROM pragma_index_list('LINE') il, pragma_index_info(il.name) ii WHERE il.origin = 'c' ORDER BY il.name, ii.seqno;"
   },
   {
    "prompt": "Create an index named <code>idx_inv_date</code> on <code>INVOICE(INV_DATE)</code>, then ask SQLite for the plan of the query that finds the invoices dated from 2026-01-17 up to but <b>not including</b> 2026-01-20 (<code>EXPLAIN QUERY PLAN SELECT * FROM INVOICE WHERE ...</code>). Your last result must be the plan, and it should show a SEARCH that uses your index.",
    "starter": "-- 1) CREATE INDEX ...\n-- 2) EXPLAIN QUERY PLAN SELECT * FROM INVOICE WHERE ...\n",
    "solution": "CREATE INDEX idx_inv_date ON INVOICE(INV_DATE);\nEXPLAIN QUERY PLAN SELECT * FROM INVOICE WHERE INV_DATE >= '2026-01-17' AND INV_DATE < '2026-01-20';"
   }
  ]
 },
 "quiz": [
  {
   "q": "An index exists on (status, region). A query filters WHERE region = 'EU' AND status = 'paid' and sorts by created. What does SQLite do?",
   "options": [
    "It ignores the index, because its columns are in a different order from the WHERE clause",
    "It returns the rows already sorted, because the index covers both filter columns",
    "It uses the index to find the rows, but still has to sort them afterwards",
    "It scans the whole table, because a composite index needs all three columns to be used"
   ],
   "correct": 2,
   "why": "SQLite does not care about the order of conditions in the WHERE clause, so it uses both index columns. But the index is sorted by (status, region), not by created, so the rows still have to be sorted. An index on (region, status, created) would avoid the sort."
  },
  {
   "q": "Why can SQLite not use an index on created for WHERE substr(created, 1, 7) = '2024-03'?",
   "options": [
    "The index is sorted by created, not by the result of the function",
    "substr is not allowed in a WHERE clause on a column that has an index",
    "Indexes only work on columns that hold integers, not on text",
    "The index is only used when the query also sorts by that same column"
   ],
   "correct": 0,
   "why": "An index is sorted by the stored value. A function changes the value, so the sorted order says nothing about the result of substr. Rewrite the condition as a range on the column itself."
  }
 ]
};
  const PROJECT = {
 "id": "gym-booking-project",
 "part": 5,
 "chapter": "Capstone project",
 "title": "Project: a booking database that defends itself",
 "minutes": 60,
 "goal": "Design, load, query and protect a small booking database in five milestones, each checked by SQL tests: constraints, data, a guarded insert, an occupancy report, and an index with an audit trigger.",
 "sections": [
  {
   "h": "The brief",
   "html": "<p>A climbing gym sells places in classes. Members, classes and bookings must stay consistent without relying on every developer to remember the rules: nobody books the same class twice, a class never takes more people than it has places, and cancellations leave a trace. You will build the database so that it defends itself, then report on it and make it fast. Every milestone starts from the one before, which is given to you, and is graded by what the database contains afterwards.</p>"
  },
  {
   "h": "Five milestones",
   "html": "<ol><li><b>Schema.</b> Three tables with keys, NOT NULL, UNIQUE, CHECK and foreign keys.</li><li><b>Data.</b> Load members, classes and bookings, parents before children.</li><li><b>Guarded bookings.</b> Inserts that only happen if a seat remains, checked and written in one statement.</li><li><b>Occupancy report.</b> A join with grouping and a condition on an aggregate.</li><li><b>Index and audit trail.</b> An index for the seat count and a trigger that logs every cancellation.</li></ol><p>A milestone solved with hints is recorded as assisted.</p>"
  },
  {
   "h": "Definition of done",
   "html": "<ul><li>The database itself rejects a duplicate booking, a negative capacity and a booking for a member or class that does not exist.</li><li>No class ever holds more bookings than its capacity.</li><li>The report counts classes with no bookings correctly.</li><li>Every cancellation is in the log, and the index exists before the heavy queries run.</li></ul>"
  },
  {
   "h": "What passing does and does not show",
   "html": "<p>The checks inspect the final state of the database, so they show that you can build these structures correctly. They cannot see how you got there: a hard-coded INSERT passes the guarded-booking check just as a real guard does, so use the hints and the worked solution to compare approaches. And a guarded insert is not a full answer to two people booking at the same moment: that needs transactions and locking, covered in the transactions lesson.</p>"
  }
 ],
 "widget": null,
 "terms": [
  [
   "Constraint",
   "A rule that the database enforces itself, such as NOT NULL, UNIQUE, CHECK or a foreign key."
  ],
  [
   "Guarded insert",
   "An INSERT whose SELECT returns a row only when a condition holds, so the check and the write happen in one statement."
  ],
  [
   "Trigger",
   "A stored rule that runs automatically when rows are inserted, updated or deleted."
  ],
  [
   "Audit trail",
   "A record of what changed in the data, kept in a separate table."
  ]
 ],
 "lab": {
  "intro": "Each milestone starts from the previous one (given in the editor). Your statements run on a fresh database, and the result is graded by inspecting what the database contains afterwards.",
  "tasks": [
   {
    "prompt": "<b>Milestone 1: the schema.</b> A climbing gym takes class bookings. Create three tables: <code>GYM_MEMBER</code> (MEMBER_ID integer primary key; NAME text not null; EMAIL text not null and unique; JOINED text not null), <code>GYM_CLASS</code> (CLASS_ID integer primary key; TITLE text not null; STARTS text not null; CAPACITY integer not null with CHECK (CAPACITY &gt; 0)) and <code>GYM_BOOKING</code> (BOOKING_ID integer primary key; MEMBER_ID and CLASS_ID integer not null, each a foreign key to its table; the pair (MEMBER_ID, CLASS_ID) unique, so nobody books the same class twice).",
    "starter": "-- Write the three CREATE TABLE statements here\n",
    "solution": "CREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);",
    "check": "SELECT fact FROM (\n  SELECT m.name || '.' || t.name || ' ' || t.type || ' notnull=' || t.\"notnull\" || ' pk=' || t.pk AS fact\n    FROM sqlite_master m, pragma_table_info(m.name) t WHERE m.type = 'table' AND m.name IN ('GYM_MEMBER', 'GYM_CLASS', 'GYM_BOOKING')\n  UNION ALL\n  SELECT m.name || ' references ' || f.\"table\" || '(' || f.\"to\" || ') via ' || f.\"from\"\n    FROM sqlite_master m, pragma_foreign_key_list(m.name) f WHERE m.type = 'table' AND m.name IN ('GYM_MEMBER', 'GYM_CLASS', 'GYM_BOOKING')\n  UNION ALL\n  SELECT m.name || ' unique on ' || (SELECT group_concat(name) FROM pragma_index_info(il.name))\n    FROM sqlite_master m, pragma_index_list(m.name) il WHERE m.type = 'table' AND m.name IN ('GYM_MEMBER', 'GYM_CLASS', 'GYM_BOOKING') AND il.origin = 'u'\n  UNION ALL\n  SELECT m.name || ' has a CHECK constraint' FROM sqlite_master m WHERE m.type = 'table' AND m.name IN ('GYM_MEMBER', 'GYM_CLASS', 'GYM_BOOKING') AND m.sql LIKE '%CHECK%'\n) ORDER BY fact;"
   },
   {
    "prompt": "<b>Milestone 2: load the data.</b> Insert 4 members (Ana Ruiz, Ben Okafor, Chloe Park, Dev Patel with ids 1 to 4, emails ana@gym.test, ben@gym.test, chloe@gym.test, dev@gym.test and joined dates 2025-11-02, 2025-11-09, 2025-12-01, 2026-01-05), 3 classes (1 'Bouldering basics' at 2026-02-02 18:00, capacity 2; 2 'Yoga for climbers' at 2026-02-03 07:30, capacity 3; 3 'Lead climbing' at 2026-02-04 19:00, capacity 2) and 6 bookings (booking id, member, class): (1,1,1), (2,2,1), (3,1,2), (4,3,2), (5,1,3), (6,2,3).",
    "starter": "-- Milestone 1 (given): the schema\nCREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\n\n-- Your INSERT statements below\n",
    "solution": "CREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);",
    "check": "SELECT (SELECT COUNT(*) FROM GYM_MEMBER) AS members, (SELECT COUNT(*) FROM GYM_CLASS) AS classes, (SELECT COUNT(*) FROM GYM_BOOKING) AS bookings, (SELECT group_concat(NAME, ', ') FROM (SELECT NAME FROM GYM_MEMBER ORDER BY MEMBER_ID)) AS names;"
   },
   {
    "prompt": "<b>Milestone 3: book without overbooking.</b> Dev (member 4) requests classes 3, 2 and 1, in that order. Classes 1 and 3 are already full. Write one <code>INSERT ... SELECT</code> per request that adds the booking <b>only if a seat remains</b> (the number of bookings of the class is less than its capacity), so the check and the insert happen in one statement.",
    "starter": "-- Milestone 1 (given): the schema\nCREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\n-- Milestone 2 (given): the data\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\n\n-- Your three guarded INSERT statements below\n",
    "solution": "CREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\nINSERT INTO GYM_BOOKING (MEMBER_ID, CLASS_ID)\nSELECT 4, 3 WHERE (SELECT COUNT(*) FROM GYM_BOOKING WHERE CLASS_ID = 3) < (SELECT CAPACITY FROM GYM_CLASS WHERE CLASS_ID = 3);\nINSERT INTO GYM_BOOKING (MEMBER_ID, CLASS_ID)\nSELECT 4, 2 WHERE (SELECT COUNT(*) FROM GYM_BOOKING WHERE CLASS_ID = 2) < (SELECT CAPACITY FROM GYM_CLASS WHERE CLASS_ID = 2);\nINSERT INTO GYM_BOOKING (MEMBER_ID, CLASS_ID)\nSELECT 4, 1 WHERE (SELECT COUNT(*) FROM GYM_BOOKING WHERE CLASS_ID = 1) < (SELECT CAPACITY FROM GYM_CLASS WHERE CLASS_ID = 1);",
    "check": "SELECT MEMBER_ID, CLASS_ID FROM GYM_BOOKING ORDER BY BOOKING_ID;",
    "ordered": true
   },
   {
    "prompt": "<b>Milestone 4: the occupancy report.</b> For every class that is at least half full, show its title, the seats taken (<code>taken</code>), the seats left (<code>seats_left</code>) and the fill percentage rounded to a whole number (<code>fill_pct</code>). Order by fill percentage, highest first, then by title. Classes with no bookings must still be counted correctly.",
    "starter": "-- Milestone 1 (given): the schema\nCREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\n-- Milestone 2 (given): the data\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\n\n-- Your SELECT below\n",
    "solution": "CREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\nSELECT c.TITLE, COUNT(b.BOOKING_ID) AS taken, c.CAPACITY - COUNT(b.BOOKING_ID) AS seats_left,\n       ROUND(100.0 * COUNT(b.BOOKING_ID) / c.CAPACITY) AS fill_pct\nFROM GYM_CLASS c LEFT JOIN GYM_BOOKING b ON b.CLASS_ID = c.CLASS_ID\nGROUP BY c.CLASS_ID, c.TITLE, c.CAPACITY\nHAVING 100.0 * COUNT(b.BOOKING_ID) / c.CAPACITY >= 50\nORDER BY fill_pct DESC, c.TITLE;",
    "ordered": true
   },
   {
    "prompt": "<b>Milestone 5: speed and an audit trail.</b> Counting seats filters bookings by class, and cancellations must be traceable. Create an index on <code>GYM_BOOKING(CLASS_ID)</code>, create a trigger named <code>trg_cancel</code> that copies the member and class of every deleted booking into <code>GYM_CANCEL_LOG</code> (given), and then cancel booking 3 with a DELETE. The trigger must exist <b>before</b> the delete.",
    "starter": "-- Milestone 1 (given): the schema\nCREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\n-- Milestone 2 (given): the data\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\n-- (given) the audit table\nCREATE TABLE GYM_CANCEL_LOG (LOG_ID INTEGER PRIMARY KEY, MEMBER_ID INTEGER, CLASS_ID INTEGER);\n\n-- Your index, trigger and DELETE below\n",
    "solution": "CREATE TABLE GYM_MEMBER (\n  MEMBER_ID INTEGER PRIMARY KEY,\n  NAME      TEXT NOT NULL,\n  EMAIL     TEXT NOT NULL UNIQUE,\n  JOINED    TEXT NOT NULL\n);\nCREATE TABLE GYM_CLASS (\n  CLASS_ID INTEGER PRIMARY KEY,\n  TITLE    TEXT NOT NULL,\n  STARTS   TEXT NOT NULL,\n  CAPACITY INTEGER NOT NULL CHECK (CAPACITY > 0)\n);\nCREATE TABLE GYM_BOOKING (\n  BOOKING_ID INTEGER PRIMARY KEY,\n  MEMBER_ID  INTEGER NOT NULL REFERENCES GYM_MEMBER(MEMBER_ID),\n  CLASS_ID   INTEGER NOT NULL REFERENCES GYM_CLASS(CLASS_ID),\n  UNIQUE (MEMBER_ID, CLASS_ID)\n);\nINSERT INTO GYM_MEMBER VALUES (1, 'Ana Ruiz', 'ana@gym.test', '2025-11-02'), (2, 'Ben Okafor', 'ben@gym.test', '2025-11-09'), (3, 'Chloe Park', 'chloe@gym.test', '2025-12-01'), (4, 'Dev Patel', 'dev@gym.test', '2026-01-05');\nINSERT INTO GYM_CLASS VALUES (1, 'Bouldering basics', '2026-02-02 18:00', 2), (2, 'Yoga for climbers', '2026-02-03 07:30', 3), (3, 'Lead climbing', '2026-02-04 19:00', 2);\nINSERT INTO GYM_BOOKING VALUES (1, 1, 1), (2, 2, 1), (3, 1, 2), (4, 3, 2), (5, 1, 3), (6, 2, 3);\nCREATE TABLE GYM_CANCEL_LOG (LOG_ID INTEGER PRIMARY KEY, MEMBER_ID INTEGER, CLASS_ID INTEGER);\nCREATE INDEX idx_booking_class ON GYM_BOOKING(CLASS_ID);\nCREATE TRIGGER trg_cancel AFTER DELETE ON GYM_BOOKING\nBEGIN\n  INSERT INTO GYM_CANCEL_LOG (MEMBER_ID, CLASS_ID) VALUES (OLD.MEMBER_ID, OLD.CLASS_ID);\nEND;\nDELETE FROM GYM_BOOKING WHERE BOOKING_ID = 3;",
    "check": "SELECT 'index' AS kind, (SELECT name FROM pragma_index_info(il.name) WHERE seqno = 0) AS detail FROM pragma_index_list('GYM_BOOKING') il WHERE il.origin = 'c' UNION ALL SELECT 'log', MEMBER_ID || ':' || CLASS_ID FROM GYM_CANCEL_LOG ORDER BY 1, 2;",
    "ordered": true
   }
  ]
 },
 "quiz": [
  {
   "q": "Two members try to book the last seat at almost the same moment. Why is a separate SELECT COUNT followed later by an INSERT risky?",
   "options": [
    "SELECT COUNT locks the whole table until the INSERT runs, which slows everything down",
    "Both can see a seat free before either has inserted, so both bookings succeed",
    "The second INSERT is always rejected by the UNIQUE constraint on the booking",
    "Counts are cached, so they are always one transaction out of date"
   ],
   "correct": 1,
   "why": "Between the count and the insert the other booking can sneak in, so both see a free seat. Putting the check and the insert in one statement, inside a transaction, closes that gap."
  },
  {
   "q": "Why does the audit trigger copy the member and class from OLD instead of looking them up afterwards?",
   "options": [
    "OLD is faster than a subquery in every database system",
    "SQLite does not allow subqueries to be used inside of a trigger body",
    "The log table cannot contain foreign keys to the tables that it records",
    "After the delete the row is gone, so its values must be copied while it still exists"
   ],
   "correct": 3,
   "why": "In an AFTER DELETE trigger the deleted row has already gone, so OLD is the only place its values still exist."
  }
 ]
};
  const at = C.lessons.findIndex(l => l.id === 'performance');
  C.lessons.splice(at + 1, 0, LAB);
  C.lessons.push(PROJECT);
})();
