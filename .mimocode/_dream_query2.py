import sqlite3
DB = r'C:\Users\AFRAA\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get sessions from last 7 days for this project, excluding checkpoint-writer subagent sessions
cur.execute("""
    SELECT id, title, datetime(time_created, 'unixepoch') as created, 
           datetime(time_updated, 'unixepoch') as updated
    FROM session 
    WHERE project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
      AND time_created > strftime('%s', 'now', '-7 days')
      AND title NOT LIKE 'checkpoint-writer:%'
    ORDER BY time_created DESC
""")
print('=== SESSIONS LAST 7 DAYS (excl checkpoint-writer) ===')
for r in cur.fetchall():
    print(f'{r[0]}  |  {r[3]}  |  {r[1]}')

# Get count of messages per recent session
cur.execute("""
    SELECT session_id, count(*) as msg_count
    FROM message
    WHERE session_id IN (
        SELECT id FROM session 
        WHERE project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
          AND time_created > strftime('%s', 'now', '-7 days')
          AND title NOT LIKE 'checkpoint-writer:%'
    )
    GROUP BY session_id
""")
print('\n=== MESSAGE COUNT PER SESSION ===')
for r in cur.fetchall():
    print(f'{r[0]}  |  msgs={r[1]}')

conn.close()
