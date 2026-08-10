import sqlite3, json, sys

DB = r'C:\Users\AFRAA\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('=== TABLES ===')
for r in cur.fetchall(): print(r[0])

# Schema for session table
cur.execute("PRAGMA table_info(session)")
print('\n=== SESSION SCHEMA ===')
for r in cur.fetchall(): print(r)

# Schema for message table
cur.execute("PRAGMA table_info(message)")
print('\n=== MESSAGE SCHEMA ===')
for r in cur.fetchall(): print(r)

# Schema for part table
cur.execute("PRAGMA table_info(part)")
print('\n=== PART SCHEMA ===')
for r in cur.fetchall(): print(r)

# Schema for task table
cur.execute("PRAGMA table_info(task)")
print('\n=== TASK SCHEMA ===')
for r in cur.fetchall(): print(r)

# Recent sessions (all projects)
cur.execute("SELECT id, project_id, title, datetime(time_created, 'unixepoch') as created FROM session ORDER BY time_created DESC LIMIT 30")
print('\n=== RECENT SESSIONS ===')
for r in cur.fetchall():
    print(f'{r[0]}  |  proj={r[1]}  |  {r[3]}  |  {r[2]}')

conn.close()
