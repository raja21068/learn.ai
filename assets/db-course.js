/* Database Systems course: original lessons that follow the chapter structure of
   Coronel & Morris, "Database Systems: Design, Implementation & Management".
   All prose, data, labs and quizzes here are original. */
window.DB_SEED = `
PRAGMA foreign_keys = ON;
CREATE TABLE VENDOR (
  V_CODE    INTEGER PRIMARY KEY,
  V_NAME    TEXT NOT NULL,
  V_CONTACT TEXT,
  V_STATE   TEXT
);
CREATE TABLE PRODUCT (
  P_CODE     TEXT PRIMARY KEY,
  P_DESCRIPT TEXT NOT NULL,
  P_PRICE    REAL NOT NULL CHECK (P_PRICE >= 0),
  P_QOH      INTEGER NOT NULL DEFAULT 0,
  V_CODE     INTEGER REFERENCES VENDOR(V_CODE)
);
CREATE TABLE CUSTOMER (
  CUS_CODE    INTEGER PRIMARY KEY,
  CUS_LNAME   TEXT NOT NULL,
  CUS_FNAME   TEXT NOT NULL,
  CUS_CITY    TEXT,
  CUS_BALANCE REAL NOT NULL DEFAULT 0
);
CREATE TABLE INVOICE (
  INV_NUMBER INTEGER PRIMARY KEY,
  CUS_CODE   INTEGER NOT NULL REFERENCES CUSTOMER(CUS_CODE),
  INV_DATE   TEXT NOT NULL
);
CREATE TABLE LINE (
  INV_NUMBER  INTEGER NOT NULL REFERENCES INVOICE(INV_NUMBER),
  LINE_NUMBER INTEGER NOT NULL,
  P_CODE      TEXT NOT NULL REFERENCES PRODUCT(P_CODE),
  LINE_UNITS  INTEGER NOT NULL,
  LINE_PRICE  REAL NOT NULL,
  PRIMARY KEY (INV_NUMBER, LINE_NUMBER)
);
CREATE TABLE EMPLOYEE (
  EMP_ID    INTEGER PRIMARY KEY,
  EMP_LNAME TEXT NOT NULL,
  EMP_FNAME TEXT NOT NULL,
  EMP_TITLE TEXT,
  EMP_HIRE  TEXT,
  DEPT      TEXT,
  SALARY    REAL,
  MGR_ID    INTEGER REFERENCES EMPLOYEE(EMP_ID)
);
INSERT INTO VENDOR VALUES
 (21001,'Brightline Tools','Ana Ruiz','TX'),
 (21002,'Northwind Hardware','Leo Park','WA'),
 (21003,'Cedar & Co.','Mia Chen','TX'),
 (21004,'Atlas Supply','Omar Haddad','FL'),
 (21005,'Pinecrest Paints','Ivy Ndlovu','WA'),
 (21006,'Quietbrook Lumber','Sam Okafor','OR');
INSERT INTO PRODUCT VALUES
 ('HM-100','Claw hammer, 16 oz',18.99,42,21001),
 ('SD-220','Screwdriver set, 12 pc',24.50,30,21001),
 ('DR-310','Cordless drill, 18V',129.00,8,21002),
 ('SW-150','Circular saw blade, 7 in',15.75,55,21002),
 ('PT-500','Interior paint, 1 gal',34.20,60,21005),
 ('PT-510','Exterior paint, 1 gal',41.90,25,21005),
 ('BR-020','Paint brush, 2 in',6.49,120,21005),
 ('LD-800','Aluminum ladder, 8 ft',159.99,5,21004),
 ('GL-030','Work gloves, pair',9.95,80,21004),
 ('NL-001','Box of nails, 1 lb',4.25,200,21003),
 ('TP-090','Tape measure, 25 ft',12.80,48,21003),
 ('WB-777','Wheelbarrow, steel',89.00,6,NULL);
INSERT INTO CUSTOMER VALUES
 (10010,'Ramirez','Alfonso','Austin',0),
 (10011,'Dunne','Leona','Seattle',215.40),
 (10012,'Smith','Kathy','Austin',345.86),
 (10013,'Olowski','Paul','Miami',536.75),
 (10014,'Orlando','Myron','Portland',0),
 (10015,'Brown','Amy','Seattle',89.30),
 (10016,'Williams','George','Miami',0),
 (10017,'Farriss','Anne','Austin',1022.10);
INSERT INTO INVOICE VALUES
 (1001,10014,'2026-01-16'),(1002,10011,'2026-01-16'),(1003,10012,'2026-01-17'),
 (1004,10011,'2026-01-18'),(1005,10013,'2026-01-20'),(1006,10014,'2026-02-02'),
 (1007,10015,'2026-02-05'),(1008,10011,'2026-02-11');
INSERT INTO LINE VALUES
 (1001,1,'HM-100',1,18.99),(1001,2,'NL-001',3,4.25),
 (1002,1,'PT-500',2,34.20),
 (1003,1,'DR-310',1,129.00),(1003,2,'SD-220',1,24.50),(1003,3,'GL-030',2,9.95),
 (1004,1,'PT-510',3,41.90),(1004,2,'BR-020',4,6.49),
 (1005,1,'LD-800',1,159.99),
 (1006,1,'TP-090',1,12.80),(1006,2,'NL-001',5,4.25),(1006,3,'HM-100',1,18.99),
 (1007,1,'SW-150',2,15.75),
 (1008,1,'PT-500',4,34.20),(1008,2,'BR-020',2,6.49),(1008,3,'GL-030',1,9.95);
INSERT INTO EMPLOYEE VALUES
 (100,'Kolmycz','Nora','General Manager','2015-03-01','Admin',128000,NULL),
 (101,'Lewis','Rhett','Pilot','2017-06-12','Flight',96000,100),
 (102,'Vandam','Ruth','Pilot','2019-01-20','Flight',91000,101),
 (103,'Jones','Anne','Mechanic','2018-09-03','Maintenance',64000,100),
 (104,'Lange','John','Mechanic','2021-04-15','Maintenance',58000,103),
 (105,'Williams','Ivan','Accountant','2016-11-30','Finance',72000,100),
 (106,'Duzak','Megan','Accountant','2022-02-07','Finance',61000,105),
 (107,'Diante','Jorge','Pilot','2023-08-21','Flight',84000,101);
`;

window.DB_COURSE = {
  id: 'databases',
  title: 'Database Systems: Design, Implementation & Management',
  short: 'Database Systems',
  tabLabel: 'Databases',
  subtitle: 'Go from "what is a table?" to designing, querying, tuning and securing real databases — with a live SQL engine in every lesson.',
  tag: 'New · Interactive',
  category: 'databases',
  accent: '#e8505b',
  symbol: 'DB',
  level: 'Beginner to intermediate',
  lang: 'sql',
  outcome: 'Model a business problem, normalize it, implement it in SQL, query it confidently, and reason about transactions, performance, distribution, analytics and security.',
  reference: 'Follows the chapter sequence of Coronel & Morris, Database Systems: Design, Implementation & Management. Lessons, data and exercises are original; read the textbook for full depth.',
  learn: [
    'Explain why databases beat file systems and how a DBMS is organized',
    'Draw ER diagrams with correct cardinality and turn them into tables',
    'Normalize tables to 3NF/BCNF and know when to denormalize',
    'Write SELECT, JOIN, GROUP BY, subqueries, views and triggers',
    'Reason about ACID transactions, locking and isolation levels',
    'Read query plans and use indexes to speed up queries',
    'Compare distributed, warehouse, NoSQL and cloud architectures',
    'Defend a database against SQL injection and manage privileges'
  ],
  parts: ['Database concepts', 'Design concepts', 'Advanced design & implementation', 'Advanced database concepts', 'Databases and the Internet', 'Database administration'],
  lessons: [
  /* ---------------- PART 1 ---------------- */
  {
    id: 'why-databases', part: 0, chapter: 'Chapter 1', title: 'Why databases?', minutes: 12,
    goal: 'Separate data from information and see what goes wrong without a DBMS.',
    sections: [
      { h: 'Data is raw, information is useful', html: '<p><b>Data</b> are raw facts: <code>10012</code>, <code>Smith</code>, <code>345.86</code>. <b>Information</b> is data processed so that it means something: "Kathy Smith of Austin owes us $345.86 and hasn\'t paid in 30 days." Good decisions need timely, accurate information, and producing that information reliably is the whole job of a database.</p>' },
      { h: 'What a database actually is', html: '<p>A <b>database</b> is a shared, integrated store of <i>end-user data</i> (the facts) and <i>metadata</i> (data about the data: column names, types, constraints, relationships). A <b>database management system (DBMS)</b> is the software that sits between applications and that store. Every request goes through it, which lets the DBMS enforce rules, control who sees what, and keep many users from trampling each other.</p>' },
      { h: 'Life before the DBMS', html: '<p>Early systems kept each department\'s data in its own files with its own programs. That caused predictable trouble:</p><ul><li><b>Data redundancy</b>: the same customer address lives in the sales file <i>and</i> the billing file.</li><li><b>Data inconsistency</b>: someone updates one copy but not the other.</li><li><b>Structural dependence</b>: change a file layout and every program that reads it breaks.</li><li><b>Anomalies</b>: you can\'t add, change or delete one fact without touching others.</li><li>Ad hoc questions need a programmer and a new program.</li></ul><p>Try the simulation below: edit the address in one file and watch the copies drift apart.</p>' },
      { h: 'The database system environment', html: '<p>A database <i>system</i> is more than software. It has five parts: <b>hardware</b>, <b>software</b> (OS, DBMS, applications), <b>people</b> (administrators, designers, analysts, programmers, end users), <b>procedures</b> (the rules for running it), and the <b>data</b> itself. DBMS functions include data dictionary management, storage management, transformation and presentation, security, multiuser access control, backup and recovery, integrity management, a query language, and communication interfaces.</p>' }
    ],
    widget: 'filesystem',
    terms: [['Metadata', 'Data that describes data: names, types, constraints.'], ['DBMS', 'Software that manages the database and mediates all access to it.'], ['Data redundancy', 'The same fact stored in more than one place.'], ['Data inconsistency', 'Copies of the same fact that disagree.']],
    lab: {
      intro: 'This lab holds a small hardware-store database: VENDOR, PRODUCT, CUSTOMER, INVOICE, LINE and EMPLOYEE. Press <b>Run</b> (or Ctrl+Enter) to execute the query.',
      tasks: [
        { prompt: 'Run the starter query to see every customer, then change it to return <b>only the last name, first name and balance</b> of each customer.', starter: 'SELECT * FROM CUSTOMER;', solution: 'SELECT CUS_LNAME, CUS_FNAME, CUS_BALANCE FROM CUSTOMER;' }
      ]
    },
    quiz: [
      { q: 'Which statement best describes information?', options: ['Raw facts stored on disk, before anyone has looked at them', 'Data processed to reveal meaning', 'The catalog that the DBMS keeps about its own tables', 'A backup copy of the data kept at a second site'], correct: 1, why: 'Information is the result of processing raw data so that it supports a decision.' },
      { q: 'A customer\'s phone number is updated in the billing file but not in the shipping file. That is…', options: ['Structural independence between programs and data files', 'Data abstraction hiding the physical storage details', 'Referential integrity between a child and a parent table', 'Data inconsistency'], correct: 3, why: 'Redundant copies that disagree are inconsistent data, the classic file-system problem.' }
    ]
  },
  {
    id: 'data-models', part: 0, chapter: 'Chapter 2', title: 'Data models', minutes: 12,
    goal: 'Describe the building blocks of a data model and the levels of data abstraction.',
    sections: [
      { h: 'A model is a simplified picture', html: '<p>A <b>data model</b> is a fairly simple, often graphical, representation of complex real-world data. It is the shared language between the people who know the business and the people who build the database. A model is cheap to change; a running database is not.</p>' },
      { h: 'Four building blocks', html: '<ul><li><b>Entity</b>: a person, place, thing or event you store data about (CUSTOMER, INVOICE).</li><li><b>Attribute</b>: a characteristic of an entity (CUS_LNAME, INV_DATE).</li><li><b>Relationship</b>: an association between entities: one-to-many (1:M), many-to-many (M:N) or one-to-one (1:1).</li><li><b>Constraint</b>: a rule on the data, such as "a price is never negative".</li></ul><p>Where do these come from? From <b>business rules</b>: short, precise statements such as "a customer may generate many invoices; each invoice belongs to exactly one customer." Nouns usually become entities and verbs become relationships.</p>' },
      { h: 'How models evolved', html: '<p>The <i>hierarchical</i> model (1960s) stored parent–child trees. The <i>network</i> model allowed a record to have several parents. The <b>relational</b> model (Codd, 1970) replaced pointers with tables and values, and that change gave us SQL. Later came the <i>entity relationship</i> model for design, <i>object-oriented</i> and <i>object/relational</i> extensions, XML, and today the <i>NoSQL</i> family for big, fast-changing data.</p>' },
      { h: 'Degrees of abstraction', html: '<p>The ANSI/SPARC architecture separates <b>external</b> (each user group\'s view), <b>conceptual</b> (the whole organization\'s view, usually an ERD), <b>internal</b> (how the chosen DBMS represents it) and <b>physical</b> (files, pages, disks) models. Each layer can change without breaking the one above it: that is <i>logical</i> and <i>physical independence</i>. Click the layers below.</p>' }
    ],
    widget: 'abstraction',
    terms: [['Business rule', 'A precise statement of a policy that shapes the data model.'], ['Conceptual model', 'A DBMS-independent, organization-wide view of data.'], ['Logical independence', 'Changing the internal model without affecting the conceptual model.']],
    lab: {
      intro: 'SQLite stores its own metadata in a system table named <code>sqlite_master</code>. That table is the data dictionary in action.',
      tasks: [
        { prompt: 'List the <b>names of all tables</b> in this database by querying <code>sqlite_master</code> where <code>type = \'table\'</code>.', starter: "SELECT type, name FROM sqlite_master;", solution: "SELECT name FROM sqlite_master WHERE type = 'table';" }
      ]
    },
    quiz: [
      { q: '"Each invoice is generated by exactly one customer" is an example of a…', options: ['A physical model that describes the storage layout', 'An index that speeds up lookups on invoice numbers', 'Business rule', 'A transaction that bundles several changes together'], correct: 2, why: 'It is a precise policy statement that defines a relationship and its cardinality.' },
      { q: 'Which model is independent of both hardware and the DBMS software?', options: ['Conceptual', 'Physical, because it describes files and disk blocks', 'Internal, because it describes how the DBMS stores rows', 'None of them, since every model depends on some hardware'], correct: 0, why: 'The conceptual model describes the organization\'s data without committing to any DBMS.' }
    ]
  },
  /* ---------------- PART 2 ---------------- */
  {
    id: 'relational-model', part: 1, chapter: 'Chapter 3', title: 'The relational model & keys', minutes: 15,
    goal: 'Identify superkeys, candidate keys, primary and foreign keys, and the integrity rules they enforce.',
    sections: [
      { h: 'Tables as relations', html: '<p>In the relational model a <b>table</b> (relation) is a two-dimensional grid of rows (<i>tuples</i>) and columns (<i>attributes</i>). Each row/column intersection holds a single value; each column has a domain of allowed values; row and column order carry no meaning; and every row must be uniquely identifiable.</p>' },
      { h: 'The family of keys', html: '<ul><li><b>Superkey</b>: any set of columns that uniquely identifies each row.</li><li><b>Candidate key</b>: a <i>minimal</i> superkey, with no column you could drop.</li><li><b>Primary key (PK)</b>: the candidate key chosen as the main identifier. It can\'t be null.</li><li><b>Foreign key (FK)</b>: a column whose values must match a PK in another (or the same) table.</li><li><b>Secondary key</b>: used only for retrieval, such as a last name.</li></ul><p>Use the key explorer below: pick columns and it checks the actual data to see whether they form a superkey or a candidate key.</p>' },
      { h: 'Integrity rules', html: '<p><b>Entity integrity</b>: every PK value is unique and not null. <b>Referential integrity</b>: every FK value is either null (if allowed) or matches an existing PK value. In the lab, try inserting a product for a vendor that doesn\'t exist and watch the DBMS refuse it.</p>' },
      { h: 'Relational set operators', html: '<p>Relational algebra gives us SELECT (restrict rows), PROJECT (choose columns), UNION, INTERSECT, DIFFERENCE, PRODUCT, JOIN and DIVIDE. SQL is built on these. The <b>data dictionary</b> and <b>system catalog</b> store the description of every table, which makes a relational database <i>self-describing</i>.</p>' }
    ],
    widget: 'keys',
    terms: [['Candidate key', 'A minimal superkey.'], ['Entity integrity', 'Primary keys are unique and never null.'], ['Referential integrity', 'Foreign keys match an existing primary key or are null.']],
    lab: {
      intro: 'Foreign keys are switched on (<code>PRAGMA foreign_keys = ON</code>). Vendor <code>99999</code> does not exist.',
      tasks: [
        { prompt: 'Run the INSERT and read the error: that is referential integrity at work. Then replace it with a query that finds the product(s) that have <b>no vendor</b> (<code>V_CODE IS NULL</code>).', starter: "INSERT INTO PRODUCT VALUES ('XX-1','Mystery item',5,1,99999);", solution: 'SELECT * FROM PRODUCT WHERE V_CODE IS NULL;' }
      ]
    },
    quiz: [
      { q: 'In LINE, why is (INV_NUMBER, LINE_NUMBER) the primary key rather than (INV_NUMBER, LINE_NUMBER, P_CODE)?', options: ['P_CODE can be null, which a primary key does not allow in this table', 'Primary keys must have exactly two columns in a relational table', 'The 3-column version is a superkey but not minimal', 'P_CODE is a foreign key, so it can never be part of any key'], correct: 2, why: 'Adding P_CODE still identifies rows uniquely, but it is not minimal, so it is a superkey, not a candidate key.' },
      { q: 'Referential integrity guarantees that…', options: ['Every foreign key value matches an existing primary key (or is null)', 'No column of any table in the database may contain a null value at all', 'Rows of every table are stored on disk in primary key order, so lookups are fast', 'Every table has at least one index on each of its foreign key columns'], correct: 0, why: 'That is the definition of referential integrity.' }
    ]
  },
  {
    id: 'er-modeling', part: 1, chapter: 'Chapter 4', title: 'Entity relationship modeling', minutes: 15,
    goal: 'Read and draw crow\'s foot ER diagrams and implement 1:1, 1:M and M:N relationships.',
    sections: [
      { h: 'The ER vocabulary', html: '<p>An ERD shows <b>entities</b> as boxes, <b>attributes</b> inside them, and <b>relationships</b> as lines. Attributes can be <i>required</i> or <i>optional</i>, <i>simple</i> or <i>composite</i> (an address), <i>single-valued</i> or <i>multivalued</i> (several phone numbers), and <i>derived</i> (age from date of birth).</p>' },
      { h: 'Connectivity, cardinality, participation', html: '<p><b>Connectivity</b> classifies a relationship as 1:1, 1:M or M:N. <b>Cardinality</b> gives the minimum and maximum count, written (min,max). <b>Participation</b> is <i>mandatory</i> (min 1) or <i>optional</i> (min 0). In crow\'s foot notation a ring means zero, a bar means one, and the three-pronged foot means many.</p>' },
      { h: 'Weak entities and strength', html: '<p>A relationship is <b>strong (identifying)</b> when the child\'s PK contains the parent\'s PK, as in LINE(INV_NUMBER, LINE_NUMBER). A <b>weak entity</b> is existence-dependent on its parent and borrows part of its key. A <b>recursive</b> relationship links an entity to itself, like EMPLOYEE manages EMPLOYEE.</p>' },
      { h: 'M:N needs a bridge', html: '<p>Relational tables can\'t store M:N directly. You add a <b>composite (bridge/associative) entity</b> whose PK combines the FKs of both sides. An INVOICE contains many PRODUCTs and a PRODUCT appears on many INVOICEs, so LINE is the bridge. Use the builder below to watch each connectivity turn into tables.</p>' }
    ],
    widget: 'erd',
    terms: [['Connectivity', '1:1, 1:M or M:N classification of a relationship.'], ['Weak entity', 'Existence-dependent entity whose PK includes its parent\'s PK.'], ['Bridge entity', 'A composite entity that implements an M:N relationship.']],
    lab: {
      intro: 'LINE is the bridge between INVOICE and PRODUCT.',
      tasks: [
        { prompt: 'Show the <b>P_CODE and LINE_UNITS</b> of every line on invoice <b>1003</b>.', starter: 'SELECT * FROM LINE;', solution: 'SELECT P_CODE, LINE_UNITS FROM LINE WHERE INV_NUMBER = 1003;' },
        { prompt: 'The recursive relationship: list each employee\'s <b>EMP_LNAME and MGR_ID</b> for employees who <b>have</b> a manager.', starter: 'SELECT * FROM EMPLOYEE;', solution: 'SELECT EMP_LNAME, MGR_ID FROM EMPLOYEE WHERE MGR_ID IS NOT NULL;' }
      ]
    },
    quiz: [
      { q: 'STUDENT and CLASS have an M:N relationship. How do you implement it?', options: ['Put CLASS_ID in STUDENT as a foreign key, one class per student', 'Create ENROLL with FKs to both tables', 'Put STUDENT_ID in CLASS as a foreign key, one student per class', 'Merge STUDENT and CLASS into a single table with repeating groups'], correct: 1, why: 'A bridge entity such as ENROLL resolves M:N into two 1:M relationships.' },
      { q: 'In crow\'s foot notation, a ring next to an entity means…', options: ['Mandatory participation (minimum one) on that side of the relationship', 'A weak entity that depends on its parent for identification', 'A derived attribute that is computed from other attributes', 'Optional participation (minimum zero)'], correct: 3, why: 'The ring (O) denotes zero, so the participation is optional.' }
    ]
  },
  {
    id: 'advanced-modeling', part: 1, chapter: 'Chapter 5', title: 'Advanced data modeling', minutes: 12,
    goal: 'Use supertypes/subtypes, pick good primary keys, and avoid design traps.',
    sections: [
      { h: 'Extended ER: supertypes and subtypes', html: '<p>When some instances of an entity need extra attributes, model a <b>supertype</b> (EMPLOYEE) with <b>subtypes</b> (PILOT, MECHANIC, ACCOUNTANT). Subtypes inherit the supertype\'s attributes and relationships. A <b>subtype discriminator</b> (EMP_TITLE) says which subtype a row belongs to.</p>' },
      { h: 'Two constraints you must decide', html: '<ul><li><b>Disjoint vs overlapping</b>: can an employee be both a pilot and a mechanic?</li><li><b>Complete vs partial</b>: must every supertype row belong to some subtype?</li></ul><p>Toggle both in the explorer below to see how the hierarchy changes.</p>' },
      { h: 'Choosing primary keys', html: '<p>Good PKs are unique, non-null, <b>stable</b>, short and meaningless. Natural keys (a social security number, an email address) can change, can be sensitive, or can be missing. A <b>surrogate key</b>, a system-generated number, is often safer. Composite PKs fit bridge tables and weak entities.</p>' },
      { h: 'Design traps', html: '<p>A <b>fan trap</b> appears when one entity has two 1:M relationships that hide an association you actually need (DIVISION→TEAM and DIVISION→PLAYER can\'t tell you which team a player is on). Fix it by restructuring as DIVISION→TEAM→PLAYER. Also watch for <b>redundant relationships</b> and decide carefully where the FK lives in 1:1 relationships. <b>Entity clustering</b> groups related entities into "virtual" entities to keep big diagrams readable.</p>' }
    ],
    widget: 'subtype',
    terms: [['Subtype discriminator', 'Attribute that determines a row\'s subtype.'], ['Surrogate key', 'A system-assigned PK with no business meaning.'], ['Fan trap', 'A structure that hides a needed association between entities.']],
    lab: {
      intro: 'EMP_TITLE acts as the subtype discriminator in EMPLOYEE.',
      tasks: [
        { prompt: 'List the <b>first and last names</b> of all employees in the <b>Pilot</b> subtype.', starter: 'SELECT EMP_TITLE, COUNT(*) FROM EMPLOYEE GROUP BY EMP_TITLE;', solution: "SELECT EMP_FNAME, EMP_LNAME FROM EMPLOYEE WHERE EMP_TITLE = 'Pilot';" }
      ]
    },
    quiz: [
      { q: 'An employee can be both a pilot and a mechanic. The subtypes are…', options: ['Disjoint, since a pilot can never also be a mechanic', 'Partial, because not every employee needs a subtype', 'Weak, because the subtypes depend on the supertype key', 'Overlapping'], correct: 3, why: 'Overlapping subtypes allow one supertype instance to appear in more than one subtype.' },
      { q: 'Why are surrogate keys often preferred over natural keys?', options: ['They are always shorter strings than natural keys, so they save a lot of space', 'They remove the need for foreign keys between related tables', 'They are stable and carry no business meaning that might change', 'SQL requires every table to have a surrogate primary key to be valid'], correct: 2, why: 'A surrogate never changes when business facts change, which keeps every FK reference valid.' }
    ]
  },
  {
    id: 'normalization', part: 1, chapter: 'Chapter 6', title: 'Normalization', minutes: 18,
    goal: 'Walk a table from unnormalized form to 3NF/BCNF and explain each step.',
    sections: [
      { h: 'Why normalize?', html: '<p>Badly structured tables cause <b>anomalies</b>. <i>Update</i>: change an employee\'s job rate in one row and miss the others. <i>Insertion</i>: you can\'t add a new employee until they are assigned a project. <i>Deletion</i>: deleting the last row of a project also deletes the only record of an employee. Normalization removes these by splitting tables on their <b>functional dependencies</b>.</p>' },
      { h: 'Dependencies in one line each', html: '<ul><li><b>A → B</b>: each value of A determines exactly one value of B.</li><li><b>Partial dependency</b>: B depends on only <i>part</i> of a composite key.</li><li><b>Transitive dependency</b>: B depends on a non-key C, which depends on the key.</li></ul>' },
      { h: 'The normal forms', html: '<ul><li><b>1NF</b>: no repeating groups, a PK is identified, every attribute depends on the PK.</li><li><b>2NF</b>: 1NF plus no partial dependencies.</li><li><b>3NF</b>: 2NF plus no transitive dependencies.</li><li><b>BCNF</b>: every determinant is a candidate key.</li><li><b>4NF</b>: no independent multivalued dependencies.</li></ul><p>Step through the example below: a project-assignment report becomes three clean tables.</p>' },
      { h: 'Denormalization is a trade-off', html: '<p>Normalized designs mean more joins. For reporting or data warehouses, designers sometimes <b>denormalize</b> on purpose (store a total, keep a derived column) to gain speed. The price is redundancy, so do it deliberately and document it. A normalized design is the starting point, not always the end point.</p>' }
    ],
    widget: 'normalize',
    terms: [['Functional dependency', 'A → B: the value of A determines the value of B.'], ['Partial dependency', 'Dependency on part of a composite key (violates 2NF).'], ['Transitive dependency', 'Dependency through a non-key attribute (violates 3NF).']],
    lab: {
      intro: 'In a normalized design, vendor details live only in VENDOR. PRODUCT just stores the V_CODE.',
      tasks: [
        { prompt: 'Return the <b>distinct</b> vendor codes that actually supply products (exclude NULL), sorted ascending.', starter: 'SELECT V_CODE FROM PRODUCT;', solution: 'SELECT DISTINCT V_CODE FROM PRODUCT WHERE V_CODE IS NOT NULL ORDER BY V_CODE;', ordered: true }
      ]
    },
    quiz: [
      { q: 'Table (PROJ_NUM, EMP_NUM, EMP_NAME, HOURS) has PK (PROJ_NUM, EMP_NUM). EMP_NUM → EMP_NAME is a…', options: ['Partial dependency', 'Transitive dependency, because EMP_NAME depends on a non-key column', 'Multivalued dependency, because an employee has many names', 'Full dependency, because it involves the whole composite key'], correct: 0, why: 'EMP_NAME depends on only part of the composite key, which violates 2NF.' },
      { q: 'A table is in 3NF when it is in 2NF and…', options: ['Has no null values in any of its columns', 'Has no transitive dependencies', 'Has a surrogate key instead of a natural key', 'Has at most three columns, which keeps the table small'], correct: 1, why: '3NF removes dependencies between non-key attributes.' }
    ]
  },
  /* ---------------- PART 3 ---------------- */
  {
    id: 'sql-select', part: 2, chapter: 'Chapter 7', title: 'SQL: SELECT, WHERE, ORDER BY', minutes: 15,
    goal: 'Retrieve exactly the rows and columns you want, in the order you want.',
    sections: [
      { h: 'SQL in a nutshell', html: '<p>SQL is <b>declarative</b>: you say <i>what</i> you want and the DBMS works out <i>how</i>. It has a data definition language (DDL: CREATE, ALTER, DROP), a data manipulation language (DML: SELECT, INSERT, UPDATE, DELETE), transaction control (COMMIT, ROLLBACK) and data control (GRANT, REVOKE).</p>' },
      { h: 'Anatomy of a query', html: '<pre class="snip">SELECT   columns / expressions / aliases\nFROM     tables\nWHERE    row conditions\nORDER BY columns [ASC|DESC];</pre><p>Use computed columns (<code>P_PRICE * P_QOH AS STOCK_VALUE</code>), <code>DISTINCT</code> to drop duplicates, and aliases to rename output.</p>' },
      { h: 'Filtering rows', html: '<ul><li>Comparison: <code>=, &lt;&gt;, &lt;, &gt;, &lt;=, &gt;=</code></li><li>Logic: <code>AND, OR, NOT</code> (use parentheses!)</li><li>Ranges and lists: <code>BETWEEN 10 AND 50</code>, <code>IN (21001, 21003)</code></li><li>Patterns: <code>LIKE \'PT-%\'</code> (% any run of characters, _ one character)</li><li>Missing values: <code>IS NULL</code>, never <code>= NULL</code></li></ul>' },
      { h: 'Logical execution order', html: '<p>Although you write SELECT first, the DBMS logically processes <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</b>. That\'s why you can\'t use a SELECT alias in WHERE in most DBMSs, but you can use it in ORDER BY.</p>' }
    ],
    widget: null,
    terms: [['DDL', 'Data definition language: CREATE, ALTER, DROP.'], ['DML', 'Data manipulation language: SELECT, INSERT, UPDATE, DELETE.'], ['Declarative', 'You describe the result, not the algorithm.']],
    lab: {
      intro: 'Practice filtering and sorting on PRODUCT.',
      tasks: [
        { prompt: 'List <b>P_CODE, P_DESCRIPT and P_PRICE</b> for products priced <b>above $30</b>, most expensive first.', starter: 'SELECT P_CODE, P_DESCRIPT, P_PRICE\nFROM PRODUCT;', solution: 'SELECT P_CODE, P_DESCRIPT, P_PRICE FROM PRODUCT WHERE P_PRICE > 30 ORDER BY P_PRICE DESC;', ordered: true },
        { prompt: 'Find all <b>paint products</b> (code starts with <code>PT-</code>) and show the stock value <code>P_PRICE * P_QOH</code> aliased <b>STOCK_VALUE</b>, along with P_CODE.', starter: 'SELECT P_CODE FROM PRODUCT;', solution: "SELECT P_CODE, P_PRICE * P_QOH AS STOCK_VALUE FROM PRODUCT WHERE P_CODE LIKE 'PT-%';" }
      ]
    },
    quiz: [
      { q: 'Which condition correctly finds rows with no vendor?', options: ['V_CODE IS NULL', 'V_CODE = NULL', 'V_CODE = \'\' (an empty string)', 'V_CODE == 0 (a zero code)'], correct: 0, why: 'NULL is unknown and never equals anything; use IS NULL.' },
      { q: 'Logically, which clause is processed first?', options: ['SELECT, because it names the columns to show', 'ORDER BY, because the sorting is decided first', 'FROM', 'WHERE, because filtering always comes before anything else'], correct: 2, why: 'The DBMS must know the source tables (FROM) before it can filter or project.' }
    ]
  },
  {
    id: 'sql-joins', part: 2, chapter: 'Chapter 7', title: 'SQL: joining tables', minutes: 15,
    goal: 'Combine tables with inner, outer, cross and self joins.',
    sections: [
      { h: 'Why joins exist', html: '<p>Normalization spreads facts across tables, and joins put them back together. A join matches rows using a condition, usually <code>FK = PK</code>. Without a condition you get a <b>Cartesian product</b> (CROSS JOIN): every row paired with every row.</p>' },
      { h: 'The join types', html: '<ul><li><b>INNER JOIN</b>: only matching rows.</li><li><b>LEFT OUTER JOIN</b>: all rows from the left table, with NULLs where there\'s no match.</li><li><b>RIGHT OUTER JOIN</b>: the mirror image.</li><li><b>FULL OUTER JOIN</b>: all rows from both sides.</li><li><b>Self join</b>: a table joined to itself under two aliases, as with employees and their managers.</li></ul><p>Pick a join type below to see which rows survive.</p>' },
      { h: 'Syntax options', html: '<pre class="snip">-- modern (recommended)\nSELECT ...\nFROM INVOICE I JOIN CUSTOMER C ON I.CUS_CODE = C.CUS_CODE;\n-- natural join / USING when column names match\nFROM INVOICE JOIN CUSTOMER USING (CUS_CODE);</pre><p>Always qualify ambiguous columns with a table alias.</p>' },
      { h: 'Finding what\'s missing', html: '<p>The pattern <i>"which X have no Y?"</i> is a LEFT JOIN followed by <code>WHERE Y.key IS NULL</code>. You\'ll use it all the time: customers with no invoices, vendors with no products.</p>' }
    ],
    widget: 'joins',
    terms: [['Inner join', 'Returns only rows that satisfy the join condition.'], ['Outer join', 'Also keeps unmatched rows, padding with NULL.'], ['Self join', 'A table joined to itself through aliases.']],
    lab: {
      intro: 'Joins across CUSTOMER, INVOICE, VENDOR and PRODUCT.',
      tasks: [
        { prompt: 'Show each <b>INV_NUMBER</b> with the customer\'s <b>CUS_LNAME</b> (inner join INVOICE and CUSTOMER).', starter: 'SELECT I.INV_NUMBER\nFROM INVOICE I;', solution: 'SELECT I.INV_NUMBER, C.CUS_LNAME FROM INVOICE I JOIN CUSTOMER C ON I.CUS_CODE = C.CUS_CODE;' },
        { prompt: 'Which vendors supply <b>no products</b>? Return <b>V_NAME</b> (hint: LEFT JOIN + IS NULL).', starter: 'SELECT V.V_NAME\nFROM VENDOR V;', solution: 'SELECT V.V_NAME FROM VENDOR V LEFT JOIN PRODUCT P ON V.V_CODE = P.V_CODE WHERE P.P_CODE IS NULL;' },
        { prompt: 'Self join: list each employee\'s <b>EMP_LNAME</b> next to their manager\'s last name aliased <b>MANAGER</b>.', starter: 'SELECT E.EMP_LNAME\nFROM EMPLOYEE E;', solution: 'SELECT E.EMP_LNAME, M.EMP_LNAME AS MANAGER FROM EMPLOYEE E JOIN EMPLOYEE M ON E.MGR_ID = M.EMP_ID;' }
      ]
    },
    quiz: [
      { q: 'CUSTOMER has 8 rows, INVOICE has 8. A CROSS JOIN returns…', options: ['8 rows, one for each customer in the table', '16 rows, the two tables stacked on top of each other', 'Only the matching rows, joined on the customer code', '64 rows'], correct: 3, why: 'A Cartesian product pairs every row with every row: 8 × 8 = 64.' },
      { q: 'To list all customers including those with no invoices, use…', options: ['CUSTOMER INNER JOIN INVOICE', 'CUSTOMER LEFT JOIN INVOICE', 'CUSTOMER CROSS JOIN INVOICE', 'INVOICE LEFT JOIN CUSTOMER'], correct: 1, why: 'The preserved (left) table must be CUSTOMER.' }
    ]
  },
  {
    id: 'sql-aggregates', part: 2, chapter: 'Chapter 7', title: 'SQL: aggregates, subqueries & set ops', minutes: 18,
    goal: 'Summarize with GROUP BY/HAVING and nest queries inside queries.',
    sections: [
      { h: 'Aggregate functions', html: '<p><code>COUNT, SUM, AVG, MIN, MAX</code> collapse many rows into one value. <code>GROUP BY</code> produces one result row per group. <code>HAVING</code> filters <i>groups</i>, while <code>WHERE</code> filters <i>rows</i> before grouping. Every non-aggregated column in SELECT must appear in GROUP BY.</p>' },
      { h: 'Subqueries', html: '<ul><li><b>Single-value</b>: <code>WHERE P_PRICE &gt; (SELECT AVG(P_PRICE) FROM PRODUCT)</code></li><li><b>Multirow</b>: <code>WHERE V_CODE IN (SELECT V_CODE FROM VENDOR WHERE V_STATE=\'TX\')</code>, plus <code>ANY</code> / <code>ALL</code></li><li><b>FROM-clause</b> (inline view): treat a query result as a table.</li><li><b>Correlated</b>: the inner query references the outer row and runs once per outer row.</li><li><code>EXISTS</code>: true when the subquery returns any row.</li></ul>' },
      { h: 'Set operators', html: '<p><code>UNION</code> (no duplicates), <code>UNION ALL</code> (keeps duplicates), <code>INTERSECT</code> and <code>EXCEPT</code>/<code>MINUS</code> combine compatible results: same number of columns with compatible types.</p>' },
      { h: 'Crafting a query', html: '<p>Work backwards: (1) what columns does the output need, (2) which tables hold them, (3) how do they join, (4) which rows qualify, (5) is it per-group, (6) what order? Build it up one clause at a time and run it after each step.</p>' }
    ],
    widget: null,
    terms: [['HAVING', 'Filters groups after aggregation.'], ['Correlated subquery', 'An inner query that references columns from the outer query.'], ['Union-compatible', 'Results with the same number of columns and compatible types.']],
    lab: {
      intro: 'Summaries over LINE and PRODUCT.',
      tasks: [
        { prompt: 'For each <b>P_CODE</b>, show total units sold as <b>TOTAL_UNITS</b>, but only products that sold <b>more than 2 units</b> in total.', starter: 'SELECT P_CODE, LINE_UNITS\nFROM LINE;', solution: 'SELECT P_CODE, SUM(LINE_UNITS) AS TOTAL_UNITS FROM LINE GROUP BY P_CODE HAVING SUM(LINE_UNITS) > 2;' },
        { prompt: 'List <b>P_DESCRIPT and P_PRICE</b> of products priced <b>above the average price</b> (use a subquery).', starter: 'SELECT AVG(P_PRICE) FROM PRODUCT;', solution: 'SELECT P_DESCRIPT, P_PRICE FROM PRODUCT WHERE P_PRICE > (SELECT AVG(P_PRICE) FROM PRODUCT);' },
        { prompt: 'Total revenue per invoice: <b>INV_NUMBER</b> and <b>SUM(LINE_UNITS * LINE_PRICE)</b> aliased <b>INV_TOTAL</b>, highest first.', starter: 'SELECT * FROM LINE;', solution: 'SELECT INV_NUMBER, SUM(LINE_UNITS * LINE_PRICE) AS INV_TOTAL FROM LINE GROUP BY INV_NUMBER ORDER BY INV_TOTAL DESC;', ordered: true }
      ]
    },
    quiz: [
      { q: 'You need only departments whose average salary exceeds 70,000. Which clause holds the condition?', options: ['WHERE, because it filters the rows before they are grouped', 'ORDER BY, because it controls the order of the groups', 'HAVING', 'FROM, because it names the table that supplies the rows'], correct: 2, why: 'Conditions on aggregates belong in HAVING.' },
      { q: 'UNION differs from UNION ALL because UNION…', options: ['Removes duplicate rows', 'Keeps duplicates, because it never compares the rows', 'Requires a JOIN between the two queries first', 'Sorts the combined result in descending order'], correct: 0, why: 'UNION eliminates duplicates; UNION ALL keeps every row.' }
    ]
  },
  {
    id: 'advanced-sql', part: 2, chapter: 'Chapter 8', title: 'Advanced SQL: DDL, views & triggers', minutes: 18,
    goal: 'Create tables with constraints, change data safely, and add views and triggers.',
    sections: [
      { h: 'Defining structures', html: '<pre class="snip">CREATE TABLE SUPPLIER_RATING (\n  V_CODE  INTEGER PRIMARY KEY REFERENCES VENDOR(V_CODE),\n  RATING  INTEGER NOT NULL CHECK (RATING BETWEEN 1 AND 5),\n  RATED_ON TEXT DEFAULT CURRENT_DATE\n);</pre><p>Constraints such as <code>PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, DEFAULT, CHECK</code> push business rules into the database, so every application obeys them. <code>ALTER TABLE</code> adds or changes columns; <code>DROP TABLE</code> removes a table.</p>' },
      { h: 'Changing data', html: '<p><code>INSERT INTO … VALUES</code> or <code>INSERT INTO … SELECT</code>; <code>UPDATE … SET … WHERE</code>; <code>DELETE FROM … WHERE</code>. <b>Forget the WHERE and you change every row.</b> Wrap risky changes in a transaction so you can <code>ROLLBACK</code>.</p>' },
      { h: 'Views: virtual tables', html: '<p><code>CREATE VIEW</code> stores a named query. Views simplify complex joins, hide sensitive columns, and give each user group its own external schema. Sequences, identity and auto-increment columns generate surrogate keys.</p>' },
      { h: 'Procedural SQL', html: '<p>Most DBMSs add procedural extensions (PL/SQL, T-SQL) for <b>stored procedures</b>, <b>functions</b>, <b>cursors</b> and <b>triggers</b>. A trigger runs automatically BEFORE or AFTER an INSERT, UPDATE or DELETE, which is great for audit trails and derived values. Embedded SQL and APIs let host languages such as Python or Java send SQL to the database.</p>' }
    ],
    widget: null,
    terms: [['Constraint', 'A rule enforced by the DBMS on column values.'], ['View', 'A stored query that behaves like a virtual table.'], ['Trigger', 'Procedural code run automatically on a data event.']],
    lab: {
      intro: 'The lab database resets each time you press <b>Reset DB</b>. You can run several statements at once; the last result is shown.',
      tasks: [
        { prompt: 'Create a view named <b>TX_PRODUCTS</b> showing <b>P_CODE, P_DESCRIPT, V_NAME</b> for products whose vendor is in Texas (V_STATE = \'TX\'), then <code>SELECT * FROM TX_PRODUCTS;</code>', starter: "CREATE VIEW TX_PRODUCTS AS\nSELECT ...\n;\nSELECT * FROM TX_PRODUCTS;", solution: "CREATE VIEW TX_PRODUCTS AS SELECT P.P_CODE, P.P_DESCRIPT, V.V_NAME FROM PRODUCT P JOIN VENDOR V ON P.V_CODE = V.V_CODE WHERE V.V_STATE = 'TX'; SELECT * FROM TX_PRODUCTS;", check: 'SELECT * FROM TX_PRODUCTS' },
        { prompt: 'Create a trigger <b>TRG_LINE_QOH</b> that, <b>after</b> each INSERT on LINE, subtracts NEW.LINE_UNITS from that product\'s P_QOH. Test it by inserting line (1007, 2, \'NL-001\', 10, 4.25).', starter: "CREATE TRIGGER TRG_LINE_QOH AFTER INSERT ON LINE\nBEGIN\n  UPDATE PRODUCT SET P_QOH = ... WHERE ...;\nEND;\nINSERT INTO LINE VALUES (1007, 2, 'NL-001', 10, 4.25);\nSELECT P_CODE, P_QOH FROM PRODUCT WHERE P_CODE = 'NL-001';", solution: "CREATE TRIGGER TRG_LINE_QOH AFTER INSERT ON LINE BEGIN UPDATE PRODUCT SET P_QOH = P_QOH - NEW.LINE_UNITS WHERE P_CODE = NEW.P_CODE; END; INSERT INTO LINE VALUES (1007, 2, 'NL-001', 10, 4.25); SELECT P_CODE, P_QOH FROM PRODUCT WHERE P_CODE = 'NL-001';", check: "SELECT P_CODE, P_QOH FROM PRODUCT ORDER BY P_CODE" }
      ]
    },
    quiz: [
      { q: 'What happens with `UPDATE PRODUCT SET P_PRICE = 0;`?', options: ['Nothing happens, because a WHERE clause is required', 'Every product\'s price becomes 0', 'Only the first row changes, since no condition was given', 'The statement fails with a syntax error at the semicolon'], correct: 1, why: 'Without WHERE, UPDATE applies to every row.' },
      { q: 'A good use of a trigger is…', options: ['Speeding up SELECT queries on the salary column', 'Replacing the primary keys of the employee table', 'Formatting the monthly payroll reports for managers', 'Writing an audit row whenever a salary changes'], correct: 3, why: 'Triggers react automatically to data events, which makes them ideal for audit trails.' }
    ]
  },
  {
    id: 'database-design', part: 2, chapter: 'Chapter 9', title: 'Database design life cycle', minutes: 12,
    goal: 'Place database design inside the information system and follow the DBLC.',
    sections: [
      { h: 'Databases live inside systems', html: '<p>An <b>information system</b> collects, stores and retrieves data and turns it into information through people, hardware, software, the database, applications and procedures. The <b>Systems Development Life Cycle</b> (planning, analysis, detailed design, implementation, maintenance) builds the whole system. The database follows its own parallel cycle.</p>' },
      { h: 'The Database Life Cycle (DBLC)', html: '<p>Six phases: <b>initial study</b>, <b>design</b>, <b>implementation & loading</b>, <b>testing & evaluation</b>, <b>operation</b>, and <b>maintenance & evolution</b>. Design itself moves from conceptual (ERD, normalization) to DBMS selection, then logical (tables, views, integrity) and physical (storage, indexes, access paths). Click through the phases below.</p>' },
      { h: 'Top-down vs bottom-up, centralized vs decentralized', html: '<p><b>Top-down</b> starts from entities and refines to attributes; <b>bottom-up</b> starts from attributes and groups them. Small, simple projects use <b>centralized</b> design. Large ones split into modules designed by separate teams (<b>decentralized</b>) and then aggregated, which means resolving synonyms, homonyms and conflicting rules.</p>' },
      { h: 'Validate everything', html: '<p>Check the model against end-user views, transactions, reports and integrity constraints before you build. The cheapest bug is the one fixed on the whiteboard.</p>' }
    ],
    widget: 'dblc',
    terms: [['SDLC', 'Life cycle for an entire information system.'], ['DBLC', 'Six-phase life cycle for a database.'], ['Homonym', 'One name used for different things, a decentralized-design conflict.']],
    lab: {
      intro: 'Implementation phase: turn a spec into a table.',
      tasks: [
        { prompt: 'Spec: a <b>SHIPMENT</b> table with SHIP_ID (integer PK), INV_NUMBER (required, FK to INVOICE), SHIP_DATE (text, required), CARRIER (text). Create it, then insert shipment (1, 1001, \'2026-01-18\', \'UPS\') and select it.', starter: "CREATE TABLE SHIPMENT (\n  SHIP_ID INTEGER PRIMARY KEY,\n  ...\n);\n", solution: "CREATE TABLE SHIPMENT (SHIP_ID INTEGER PRIMARY KEY, INV_NUMBER INTEGER NOT NULL REFERENCES INVOICE(INV_NUMBER), SHIP_DATE TEXT NOT NULL, CARRIER TEXT); INSERT INTO SHIPMENT VALUES (1,1001,'2026-01-18','UPS'); SELECT * FROM SHIPMENT;", check: 'SELECT SHIP_ID, INV_NUMBER, SHIP_DATE, CARRIER FROM SHIPMENT' }
      ]
    },
    quiz: [
      { q: 'In which DBLC phase do you choose indexes and storage structures?', options: ['Physical design', 'Initial study, where the scope is decided', 'Operation, once the database is in daily use', 'Conceptual design, where entities and relations are drawn'], correct: 0, why: 'Physical design decides how data is stored and accessed.' },
      { q: 'Two teams use "ORDER" to mean different things. That is a…', options: ['Synonym, because two names are used for one thing', 'Surrogate, because the key has no business meaning', 'Homonym', 'Fan trap, because a join multiplies the rows'], correct: 2, why: 'One name for different meanings is a homonym.' }
    ]
  },
  /* ---------------- PART 4 ---------------- */
  {
    id: 'transactions', part: 3, chapter: 'Chapter 10', title: 'Transactions & concurrency control', minutes: 18,
    goal: 'Explain ACID, spot concurrency problems and see how locks prevent them.',
    sections: [
      { h: 'A transaction is all-or-nothing', html: '<p>A <b>transaction</b> is a logical unit of work, such as "move $100 from savings to checking". It must leave the database in a consistent state. Its properties are <b>ACID</b>: <b>A</b>tomicity (all or none), <b>C</b>onsistency (rules hold before and after), <b>I</b>solation (it can\'t see others\' half-done work), <b>D</b>urability (committed changes survive crashes). The <b>transaction log</b> records before and after values so the DBMS can undo or redo work.</p>' },
      { h: 'Concurrency problems', html: '<ul><li><b>Lost update</b>: two transactions read the same value and the second write overwrites the first.</li><li><b>Uncommitted data (dirty read)</b>: T2 reads T1\'s change, then T1 rolls back.</li><li><b>Inconsistent retrieval</b>: a summary reads some rows before and some after another transaction\'s update.</li></ul><p>The <b>scheduler</b> orders operations to produce <b>serializable</b> schedules, which give the same result as running the transactions one after another.</p>' },
      { h: 'Locks, deadlocks and alternatives', html: '<p>Locks can be taken at the database, table, page, row or field level. They can be <i>binary</i> or <i>shared/exclusive</i>. <b>Two-phase locking</b> (a growing phase, then a shrinking phase) guarantees serializability but can cause <b>deadlocks</b>, which the DBMS prevents, detects or avoids. <b>Time stamping</b> (wait/die, wound/wait) and <b>optimistic</b> methods (read → validate → write) are alternatives.</p>' },
      { h: 'Isolation levels and recovery', html: '<p>ANSI isolation levels trade safety for speed: <b>Read Uncommitted</b> → <b>Read Committed</b> → <b>Repeatable Read</b> → <b>Serializable</b>. For recovery, the DBMS uses backups, the log, checkpoints and either <i>deferred-write</i> or <i>write-through</i> techniques to roll forward committed work and roll back the rest. Run the simulator below with and without locking.</p>' }
    ],
    widget: 'txn',
    terms: [['ACID', 'Atomicity, Consistency, Isolation, Durability.'], ['Serializable schedule', 'Interleaving equivalent to some serial order.'], ['Deadlock', 'Two transactions each waiting for a lock the other holds.']],
    lab: {
      intro: 'SQLite supports BEGIN / COMMIT / ROLLBACK. Customer 10012 currently owes 345.86.',
      tasks: [
        { prompt: 'Start a transaction, set customer 10012\'s balance to 0, then <b>ROLLBACK</b> and show that CUS_BALANCE is back to 345.86.', starter: "BEGIN TRANSACTION;\nUPDATE CUSTOMER SET CUS_BALANCE = 0 WHERE CUS_CODE = 10012;\n-- undo it here\nSELECT CUS_CODE, CUS_BALANCE FROM CUSTOMER WHERE CUS_CODE = 10012;", solution: "BEGIN TRANSACTION; UPDATE CUSTOMER SET CUS_BALANCE = 0 WHERE CUS_CODE = 10012; ROLLBACK; SELECT CUS_CODE, CUS_BALANCE FROM CUSTOMER WHERE CUS_CODE = 10012;", check: 'SELECT CUS_CODE, CUS_BALANCE FROM CUSTOMER ORDER BY CUS_CODE' },
        { prompt: 'Atomic transfer: inside one transaction, move <b>100</b> of balance from customer <b>10017</b> to customer <b>10014</b>, then COMMIT.', starter: "BEGIN TRANSACTION;\n\nCOMMIT;\nSELECT CUS_CODE, CUS_BALANCE FROM CUSTOMER WHERE CUS_CODE IN (10014, 10017);", solution: "BEGIN; UPDATE CUSTOMER SET CUS_BALANCE = CUS_BALANCE - 100 WHERE CUS_CODE = 10017; UPDATE CUSTOMER SET CUS_BALANCE = CUS_BALANCE + 100 WHERE CUS_CODE = 10014; COMMIT; SELECT CUS_CODE, CUS_BALANCE FROM CUSTOMER WHERE CUS_CODE IN (10014, 10017);", check: 'SELECT CUS_CODE, ROUND(CUS_BALANCE,2) FROM CUSTOMER ORDER BY CUS_CODE' }
      ]
    },
    quiz: [
      { q: 'T1 and T2 both read a stock of 35. T1 writes 35+100, T2 writes 35−30. The final value is 5. This is…', options: ['Dirty read, because T2 saw uncommitted data', 'Phantom read, because new rows appeared mid-transaction', 'Deadlock, because each transaction waits for the other', 'Lost update'], correct: 3, why: 'T1\'s update was overwritten by T2, so it was lost.' },
      { q: 'Which ACID property ensures committed data survives a power failure?', options: ['Atomicity, which makes a transaction all or nothing', 'Durability', 'Consistency, which keeps every rule satisfied', 'Isolation, which hides concurrent transactions from one another'], correct: 1, why: 'Durability is guaranteed by the log and recovery.' }
    ]
  },
  {
    id: 'performance', part: 3, chapter: 'Chapter 11', title: 'Performance tuning & query optimization', minutes: 15,
    goal: 'Follow how a query is processed and use indexes and plans to make it faster.',
    sections: [
      { h: 'Two sides of tuning', html: '<p><b>Client side</b>: write efficient SQL. <b>Server side</b>: configure the DBMS (memory caches, I/O, storage). Most time is spent on <b>I/O</b>, and the fastest I/O is the one you avoid by finding the data already in the buffer cache.</p>' },
      { h: 'How a query is processed', html: '<ol><li><b>Parse</b>: check syntax, validate names and privileges, then turn the SQL into an algebraic form.</li><li><b>Optimize</b>: generate alternative <i>access plans</i> and pick the cheapest using statistics (row counts, distinct values, index depth).</li><li><b>Execute</b>: run the plan.</li><li><b>Fetch</b>: return the rows.</li></ol><p>Optimizers can be rule-based or <b>cost-based</b>, and the cost-based kind relies on fresh <b>statistics</b>.</p>' },
      { h: 'Indexes', html: '<p>An index is an ordered structure (usually a <b>B-tree</b>) that maps key values to row locations. It turns a full table scan (look at every row) into an index seek (a few page reads). Indexes help selective WHERE conditions, joins and ORDER BY, but they slow INSERT, UPDATE and DELETE and take space. <b>Bitmap</b> indexes suit low-cardinality columns in warehouses; <b>hash</b> indexes suit exact matches.</p>' },
      { h: 'SQL habits that help', html: '<ul><li>Compare columns to constants, not functions of columns (<code>WHERE P_PRICE &gt; 10</code>, not <code>WHERE P_PRICE*2 &gt; 20</code>).</li><li>Put the most likely-false AND condition first and the likely-true OR condition first.</li><li>Avoid <code>LIKE \'%x\'</code> with a leading wildcard because it can\'t use an index.</li><li>Select only the columns you need.</li></ul><p>Compare a scan with a seek below, then read real plans in the lab with <code>EXPLAIN QUERY PLAN</code>.</p>' }
    ],
    widget: 'scan',
    terms: [['Access plan', 'The sequence of operations chosen to run a query.'], ['Cost-based optimizer', 'Chooses plans using statistics and cost estimates.'], ['B-tree index', 'A balanced tree that enables logarithmic lookups.']],
    lab: {
      intro: '<code>EXPLAIN QUERY PLAN</code> shows SQLite\'s chosen plan. "SCAN" means a full scan; "SEARCH … USING INDEX" means an index seek.',
      tasks: [
        { prompt: 'Run the plan for a lookup by customer city: it shows a SCAN. Then add <code>CREATE INDEX CUS_CITY_IDX ON CUSTOMER(CUS_CITY);</code> <b>before</b> the EXPLAIN and rerun. The plan should now SEARCH using the index.', starter: "EXPLAIN QUERY PLAN\nSELECT * FROM CUSTOMER WHERE CUS_CITY = 'Austin';", solution: "CREATE INDEX CUS_CITY_IDX ON CUSTOMER(CUS_CITY); EXPLAIN QUERY PLAN SELECT * FROM CUSTOMER WHERE CUS_CITY = 'Austin';", check: "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='CUSTOMER' AND sql IS NOT NULL" }
      ]
    },
    quiz: [
      { q: 'Which condition is most likely to prevent index use?', options: ['CUS_LNAME LIKE \'%th\'', 'CUS_LNAME = \'Smith\'', 'CUS_LNAME LIKE \'Sm%\'', 'CUS_CODE BETWEEN 10 AND 20'], correct: 0, why: 'A leading wildcard means the ordered index can\'t narrow the search.' },
      { q: 'A cost-based optimizer depends heavily on…', options: ['The number of users connected at that moment', 'The trigger definitions on each table involved', 'Up-to-date statistics', 'The comments stored on every column of the tables'], correct: 2, why: 'Its cost estimates come from table and index statistics.' }
    ]
  },
  {
    id: 'distributed', part: 3, chapter: 'Chapter 12', title: 'Distributed databases', minutes: 12,
    goal: 'Describe fragmentation, replication, allocation and transparency in a DDBMS.',
    sections: [
      { h: 'Why distribute?', html: '<p>Global businesses need data close to users, high availability, and growth without one giant server. A <b>distributed DBMS (DDBMS)</b> governs a logically related database spread across sites while presenting it as a single database. Advantages: local control, faster local access, less risk of a single point of failure, and modular growth. Disadvantages: complexity, security, harder integrity control and higher cost.</p>' },
      { h: 'Distributed processing vs distributed database', html: '<p>Distributed <i>processing</i> spreads the work across machines but may still use one database. A distributed <i>database</i> stores the data itself at several sites. Systems range from <b>SPSD</b> (single-site processing and data) through <b>MPSD</b> to <b>MPMD</b> (multiple-site processing and data), and can be <i>homogeneous</i> or <i>heterogeneous</i>.</p>' },
      { h: 'Fragmentation, replication, allocation', html: '<ul><li><b>Horizontal fragmentation</b>: split rows (customers by region).</li><li><b>Vertical fragmentation</b>: split columns, keeping the PK in each fragment.</li><li><b>Mixed</b>: both.</li><li><b>Replication</b>: store copies at several sites, either fully or partially replicated.</li><li><b>Allocation</b>: decide where each fragment lives (centralized, partitioned, replicated).</li></ul><p>Try fragmenting the CUSTOMER table below.</p>' },
      { h: 'Transparency and CAP', html: '<p>Users shouldn\'t need to know where data lives: that is <b>distribution</b>, <b>transaction</b>, <b>failure</b>, <b>performance</b> and <b>heterogeneity transparency</b>. Distributed transactions use <b>two-phase commit</b> (prepare, then commit). The <b>CAP theorem</b> says that during a network partition you must choose between consistency and availability; many web systems pick availability with <i>eventual consistency</i> (BASE).</p>' }
    ],
    widget: 'fragment',
    terms: [['Horizontal fragmentation', 'Distributing subsets of rows.'], ['Two-phase commit', 'Prepare/commit protocol for distributed transactions.'], ['CAP theorem', 'Consistency, availability, partition tolerance: pick two during a partition.']],
    lab: {
      intro: 'Simulate a horizontal fragment by materializing one region\'s rows into its own table.',
      tasks: [
        { prompt: 'Create table <b>CUSTOMER_AUSTIN</b> holding only Austin customers (<code>CREATE TABLE … AS SELECT …</code>), then select from it.', starter: "CREATE TABLE CUSTOMER_AUSTIN AS\nSELECT ...;\nSELECT * FROM CUSTOMER_AUSTIN;", solution: "CREATE TABLE CUSTOMER_AUSTIN AS SELECT * FROM CUSTOMER WHERE CUS_CITY = 'Austin'; SELECT * FROM CUSTOMER_AUSTIN;", check: 'SELECT CUS_CODE FROM CUSTOMER_AUSTIN ORDER BY CUS_CODE' },
        { prompt: 'Reconstruct the "global" view: <b>UNION ALL</b> of the Austin fragment and the non-Austin customers, returning CUS_CODE and CUS_CITY. (Create the fragment first in the same script.)', starter: "CREATE TABLE CUSTOMER_AUSTIN AS SELECT * FROM CUSTOMER WHERE CUS_CITY = 'Austin';\nSELECT CUS_CODE, CUS_CITY FROM CUSTOMER_AUSTIN\nUNION ALL\n...;", solution: "CREATE TABLE CUSTOMER_AUSTIN AS SELECT * FROM CUSTOMER WHERE CUS_CITY = 'Austin'; SELECT CUS_CODE, CUS_CITY FROM CUSTOMER_AUSTIN UNION ALL SELECT CUS_CODE, CUS_CITY FROM CUSTOMER WHERE CUS_CITY <> 'Austin';" }
      ]
    },
    quiz: [
      { q: 'Storing PAYROLL columns at HQ and CONTACT columns at branches, each with the PK, is…', options: ['Horizontal fragmentation, where whole rows go to different sites', 'Vertical fragmentation', 'Replication, where full copies are kept at each site', 'Two-phase commit, where every site must agree before commit'], correct: 1, why: 'Splitting by columns is vertical fragmentation.' },
      { q: 'Two-phase commit exists to…', options: ['Speed up read queries by caching remote tables at the local site, for every query that follows', 'Replicate every index to all sites so that lookups never travel', 'Compress the transaction logs before they are sent between sites', 'Make a distributed transaction commit at every site or at none'], correct: 3, why: 'It coordinates atomic commits across sites.' }
    ]
  },
  {
    id: 'bi-warehouse', part: 3, chapter: 'Chapter 13', title: 'Business intelligence & data warehouses', minutes: 15,
    goal: 'Design a star schema and analyze it with OLAP operations and analytic SQL.',
    sections: [
      { h: 'From operations to decisions', html: '<p><b>Business intelligence (BI)</b> covers the architecture, tools and processes that turn operational data into decisions. Operational (OLTP) databases are optimized for many small transactions; <b>decision support</b> needs integrated, historical, summarized data. Hence the <b>data warehouse</b>: <i>integrated</i>, <i>subject-oriented</i>, <i>time-variant</i> and <i>nonvolatile</i>, loaded by <b>ETL</b> (extract, transform, load). A <b>data mart</b> is a smaller, departmental warehouse.</p>' },
      { h: 'The star schema', html: '<p>A central <b>fact table</b> holds numeric measures (units, revenue) and FKs to <b>dimension tables</b> (time, product, customer, location). Dimensions have attributes and <b>hierarchies</b> (day → month → quarter → year) that make drill-down possible. Snowflake schemas normalize the dimensions. Performance tricks include normalizing dimensions, maintaining multiple fact tables at different aggregation levels, denormalizing facts and partitioning tables.</p>' },
      { h: 'OLAP', html: '<p><b>Online analytical processing</b> gives a multidimensional view: <b>roll up</b> (aggregate up a hierarchy), <b>drill down</b> (go to detail), <b>slice and dice</b> (filter and rotate) and <b>pivot</b>. It is implemented as ROLAP (relational), MOLAP (cubes) or a hybrid. Explore a tiny cube below.</p>' },
      { h: 'Analytics, SQL and visualization', html: '<p>Analytic SQL extends GROUP BY with <code>ROLLUP</code> and <code>CUBE</code>, plus <b>window functions</b> such as <code>RANK() OVER (ORDER BY …)</code> and running totals with <code>SUM() OVER</code>. Data mining and predictive analytics look for patterns. Good visualization turns the results into insight. <b>Data lakes</b> keep raw data in native formats for later analysis.</p>' }
    ],
    widget: 'olap',
    terms: [['Fact table', 'Holds measures and FKs to dimensions.'], ['Roll up', 'Aggregate along a dimension hierarchy.'], ['ETL', 'Extract, transform, load into the warehouse.']],
    lab: {
      intro: 'SQLite supports window functions, the core of analytic SQL.',
      tasks: [
        { prompt: 'Rank products by price with <code>RANK() OVER (ORDER BY P_PRICE DESC)</code> aliased <b>PRICE_RANK</b>; return P_CODE, P_PRICE, PRICE_RANK, ordered by PRICE_RANK.', starter: 'SELECT P_CODE, P_PRICE\nFROM PRODUCT;', solution: 'SELECT P_CODE, P_PRICE, RANK() OVER (ORDER BY P_PRICE DESC) AS PRICE_RANK FROM PRODUCT ORDER BY PRICE_RANK;', ordered: true },
        { prompt: 'Monthly revenue roll-up: return <b>MONTH</b> (<code>substr(INV_DATE,1,7)</code>) and <b>REVENUE</b> (sum of units × price) by joining INVOICE and LINE, ordered by MONTH.', starter: 'SELECT substr(INV_DATE,1,7) AS MONTH\nFROM INVOICE;', solution: 'SELECT substr(I.INV_DATE,1,7) AS MONTH, SUM(L.LINE_UNITS * L.LINE_PRICE) AS REVENUE FROM INVOICE I JOIN LINE L ON I.INV_NUMBER = L.INV_NUMBER GROUP BY MONTH ORDER BY MONTH;', ordered: true }
      ]
    },
    quiz: [
      { q: 'In a star schema, "units sold" belongs in…', options: ['The fact table', 'A dimension table, since units describe the product', 'The data dictionary, which stores definitions', 'A view only, never a table in the warehouse'], correct: 0, why: 'Numeric measures are facts.' },
      { q: 'Going from yearly sales to monthly sales is…', options: ['Roll up, which moves to a coarser level of detail', 'Pivot, which rotates the axes of the report', 'Slice, which fixes one dimension at a single value', 'Drill down'], correct: 3, why: 'Moving to finer detail is drilling down.' }
    ]
  },
  {
    id: 'nosql', part: 3, chapter: 'Chapter 14', title: 'Big data & NoSQL', minutes: 15,
    goal: 'Characterize big data and compare key-value, document, column-family and graph stores.',
    sections: [
      { h: 'What makes data "big"', html: '<p>Big data is described by the <b>3 Vs</b>: <b>volume</b> (too much for one machine), <b>velocity</b> (arrives too fast) and <b>variety</b> (structured, semi-structured and unstructured). Others add variability, veracity, value and visualization. The answer is usually <b>scale out</b> (many commodity servers) rather than <b>scale up</b> (a bigger server).</p>' },
      { h: 'Hadoop', html: '<p><b>HDFS</b> splits huge files into large blocks replicated across data nodes, coordinated by a name node. <b>MapReduce</b> sends computation to the data: <i>map</i> functions emit key-value pairs and <i>reduce</i> functions aggregate them. The ecosystem adds Hive (SQL-like queries), Pig, Flume, Sqoop and HBase.</p>' },
      { h: 'Four NoSQL families', html: '<ul><li><b>Key-value</b> (Redis, DynamoDB): opaque values looked up by key, very fast.</li><li><b>Document</b> (MongoDB, Couchbase): JSON-like documents with self-describing, flexible structure, so related data can be embedded.</li><li><b>Column-family</b> (Cassandra, HBase): rows with many sparse columns grouped into families.</li><li><b>Graph</b> (Neo4j): nodes, edges and properties for highly connected data.</li></ul><p>Most NoSQL stores are <b>aggregate-aware</b>, schema-less, distributed, and favor availability with eventual consistency. <b>NewSQL</b> aims for SQL plus ACID at NoSQL scale.</p>' },
      { h: 'Same data, two shapes', html: '<p>The toggle below shows one customer and their invoices as normalized rows and as a single aggregated document. Notice the trade-off: the document is fast to read whole, but the same product details get duplicated across documents.</p>' }
    ],
    widget: 'docmodel',
    terms: [['Scale out', 'Add more commodity servers instead of a bigger one.'], ['MapReduce', 'Map emits key-value pairs; reduce aggregates them.'], ['Aggregate-aware', 'Data stored as the unit the application reads.']],
    lab: {
      intro: 'SQLite\'s JSON functions let you build documents from relational rows: the bridge between the two worlds.',
      tasks: [
        { prompt: 'For each customer that has invoices, return <b>CUS_CODE</b> and a JSON array of their invoice numbers named <b>INVOICES</b> using <code>json_group_array(INV_NUMBER)</code>, ordered by CUS_CODE.', starter: 'SELECT CUS_CODE, INV_NUMBER\nFROM INVOICE;', solution: 'SELECT CUS_CODE, json_group_array(INV_NUMBER) AS INVOICES FROM INVOICE GROUP BY CUS_CODE ORDER BY CUS_CODE;', ordered: true }
      ]
    },
    quiz: [
      { q: 'Which store best fits a social network\'s "friends of friends" queries?', options: ['Key-value, which looks up one value by its key', 'Column-family, which stores wide sparse rows', 'Graph', 'Data warehouse, which stores history for reporting'], correct: 2, why: 'Graph databases traverse relationships natively.' },
      { q: 'In MapReduce, the reduce step…', options: ['Splits large input files into blocks for the mappers', 'Aggregates values grouped by key', 'Replicates every block of data to several nodes', 'Parses SQL text into a query plan for the optimizer'], correct: 1, why: 'Reduce combines the values emitted for each key.' }
    ]
  },
  /* ---------------- PART 5 ---------------- */
  {
    id: 'connectivity-web', part: 4, chapter: 'Chapter 15', title: 'Database connectivity & the web', minutes: 12,
    goal: 'Connect applications to databases safely and understand web and cloud data services.',
    sections: [
      { h: 'Connectivity interfaces', html: '<p>Applications reach databases through standard interfaces: native SQL connectivity, <b>ODBC</b>, Microsoft\'s DAO/OLE-DB/<b>ADO.NET</b>, and <b>JDBC</b> for Java. Python has the DB-API (<code>sqlite3</code>, <code>psycopg</code>). They all share the same flow: <i>connect → prepare a command → execute → fetch results → close</i>.</p>' },
      { h: 'Web-to-database middleware', html: '<p>A browser never talks to the database directly. The web server hands the request to <b>server-side middleware</b> (PHP, Node, Python, Java), which queries the database and builds a response, often JSON through a <b>web API</b>. Client-side extensions such as JavaScript render the data. XML and JSON are the common exchange formats.</p>' },
      { h: 'SQL injection: the #1 rule', html: '<p>Never build SQL by concatenating user input. If the input is <code>\' OR \'1\'=\'1</code>, a login check turns into "always true". Use <b>parameterized queries</b> (prepared statements), where the driver sends input as data, never as code. Try the attack below.</p>' },
      { h: 'Cloud data services', html: '<p>Cloud computing delivers on-demand, scalable resources: <b>SaaS</b>, <b>PaaS</b>, <b>IaaS</b>, and managed database services (DBaaS). Benefits: elasticity, lower upfront cost and managed operations. Concerns: security, compliance, data location, vendor lock-in and network latency. SQL data services let small teams run serious databases without running servers.</p>' }
    ],
    widget: 'injection',
    terms: [['ODBC/JDBC', 'Standard APIs for connecting applications to DBMSs.'], ['Middleware', 'Server-side software between web server and database.'], ['Parameterized query', 'SQL with placeholders whose values are sent separately as data.']],
    lab: {
      intro: 'Parameterized queries are a driver feature, but you can still practice the query your API endpoint would run.',
      tasks: [
        { prompt: 'Write the query a <code>GET /customers/10011/invoices</code> endpoint would run: return <b>INV_NUMBER and INV_DATE</b> for customer <b>10011</b>, newest first.', starter: 'SELECT INV_NUMBER, INV_DATE\nFROM INVOICE;', solution: 'SELECT INV_NUMBER, INV_DATE FROM INVOICE WHERE CUS_CODE = 10011 ORDER BY INV_DATE DESC;', ordered: true }
      ]
    },
    quiz: [
      { q: 'The safest defense against SQL injection is…', options: ['Hiding the database error messages from users', 'Parameterized queries', 'Using HTTPS between the browser and the server', 'Keeping the session password in a browser cookie'], correct: 1, why: 'Parameters keep user input from ever being parsed as SQL.' },
      { q: 'Renting a managed PostgreSQL instance from a cloud provider is an example of…', options: ['IaaS only, where you manage the whole database server', 'On-premises hosting in your own data center', 'ODBC, a standard driver interface for applications', 'DBaaS / PaaS'], correct: 3, why: 'The provider manages the database platform for you.' }
    ]
  },
  /* ---------------- PART 6 ---------------- */
  {
    id: 'dba-security', part: 5, chapter: 'Chapter 16', title: 'Database administration & security', minutes: 15,
    goal: 'Describe the DBA\'s managerial and technical roles and apply least-privilege security.',
    sections: [
      { h: 'Data is a corporate asset', html: '<p>Data has value, a cost and risks, just like money or equipment. Managing it is <b>data administration</b> (DA: policies, standards, planning, a managerial role) and <b>database administration</b> (DBA: the technical work of running the DBMS). Introducing a database changes an organization technologically, managerially and culturally.</p>' },
      { h: 'What the DBA actually does', html: '<ul><li><b>Managerial</b>: plan, organize, test, monitor and deliver; support end users; enforce policies, standards and procedures; ensure data distribution and use.</li><li><b>Technical</b>: evaluate and install DBMSs, design and implement databases, test and evaluate, tune performance, run <b>backup and recovery</b>, train users, and maintain the system.</li></ul><p>Backups should be full, incremental or concurrent; stored off-site; and tested. A backup you have never restored is a hope, not a backup.</p>' },
      { h: 'Security: CIA', html: '<p>Security protects <b>confidentiality</b>, <b>integrity</b> and <b>availability</b>. A <b>security policy</b> backed by procedures addresses vulnerabilities in people, workstations, OS, network, applications and data. Tools include user authentication, <b>privileges</b> (GRANT/REVOKE), <b>roles</b>, views to hide columns, auditing, encryption and physical safeguards. Apply <b>least privilege</b>: give everyone only what their job needs. Build the privilege matrix below.</p>' },
      { h: 'Tools and the cloud', html: '<p>The <b>data dictionary</b> and CASE tools document the database. Monitoring tools track performance. In the cloud the DBA\'s job shifts from hardware toward cost control, configuration, security, and planning for vendor-managed upgrades and service levels.</p>' }
    ],
    widget: 'roles',
    terms: [['Least privilege', 'Grant only the minimum access needed.'], ['CIA triad', 'Confidentiality, integrity, availability.'], ['Role', 'A named set of privileges assigned to users.']],
    lab: {
      intro: 'SQLite has no GRANT, but views and triggers implement two real security controls: column hiding and auditing.',
      tasks: [
        { prompt: 'Create a view <b>EMP_PUBLIC</b> exposing only EMP_ID, EMP_FNAME, EMP_LNAME and DEPT (hide SALARY), then select from it.', starter: 'CREATE VIEW EMP_PUBLIC AS\nSELECT ...;\nSELECT * FROM EMP_PUBLIC;', solution: 'CREATE VIEW EMP_PUBLIC AS SELECT EMP_ID, EMP_FNAME, EMP_LNAME, DEPT FROM EMPLOYEE; SELECT * FROM EMP_PUBLIC;', check: 'SELECT * FROM EMP_PUBLIC' },
        { prompt: 'Audit trail: create table <b>SALARY_AUDIT(EMP_ID, OLD_SAL, NEW_SAL)</b> and a trigger <b>TRG_SAL_AUDIT</b> AFTER UPDATE OF SALARY ON EMPLOYEE that logs each change. Then give employee 104 a raise to 60000 and select from SALARY_AUDIT.', starter: "CREATE TABLE SALARY_AUDIT (EMP_ID INTEGER, OLD_SAL REAL, NEW_SAL REAL);\nCREATE TRIGGER TRG_SAL_AUDIT AFTER UPDATE OF SALARY ON EMPLOYEE\nBEGIN\n  INSERT INTO SALARY_AUDIT VALUES (...);\nEND;\nUPDATE EMPLOYEE SET SALARY = 60000 WHERE EMP_ID = 104;\nSELECT * FROM SALARY_AUDIT;", solution: "CREATE TABLE SALARY_AUDIT (EMP_ID INTEGER, OLD_SAL REAL, NEW_SAL REAL); CREATE TRIGGER TRG_SAL_AUDIT AFTER UPDATE OF SALARY ON EMPLOYEE BEGIN INSERT INTO SALARY_AUDIT VALUES (OLD.EMP_ID, OLD.SALARY, NEW.SALARY); END; UPDATE EMPLOYEE SET SALARY = 60000 WHERE EMP_ID = 104; SELECT * FROM SALARY_AUDIT;", check: 'SELECT EMP_ID, OLD_SAL, NEW_SAL FROM SALARY_AUDIT' }
      ]
    },
    quiz: [
      { q: 'An intern needs to read product prices only. Least privilege means granting…', options: ['The DBA role, so that the intern can fix anything', 'ALL privileges on PRODUCT, to avoid later requests', 'SELECT on PRODUCT', 'UPDATE on PRODUCT, so that prices can be corrected'], correct: 2, why: 'Grant only what the task needs: read access to one table.' },
      { q: 'Which is a managerial (not technical) DBA responsibility?', options: ['Enforcing data standards and policies', 'Tuning buffer caches to reduce disk reads', 'Installing patches on the database server', 'Rebuilding fragmented indexes during off-hours'], correct: 0, why: 'Policies and standards are part of the DBA\'s managerial role.' }
    ]
  }
  ]
};
