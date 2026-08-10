import sqlite3, json
DB = r'C:\Users\AFRAA\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get recent sessions (last 7 days) that are NOT checkpoint-writer or dream
cur.execute("""
    SELECT id, title, datetime(time_created, 'unixepoch') as created
    FROM session 
    WHERE project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
      AND time_created > strftime('%s', 'now', '-7 days')
      AND title NOT LIKE 'checkpoint-writer:%'
      AND title NOT LIKE 'Auto Dream%'
    ORDER BY time_created DESC
    LIMIT 15
""")
sessions = cur.fetchall()

for sid, title, created in sessions:
    print(f'\n=== SESSION: {title} ({created}) ===')
    print(f'ID: {sid}')
    
    # Get user messages containing keywords
    cur.execute("""
        SELECT m.id, p.data
        FROM message m
        JOIN part p ON p.message_id = m.id
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'user'
        ORDER BY m.time_created
    """, (sid,))
    
    for msg_id, pdata in cur.fetchall():
        try:
            d = json.loads(pdata)
            if d.get('type') == 'text':
                text = d.get('text', '')
                # Only show messages with keywords
                keywords = ['always', 'never', 'remember', 'rule', 'decision', 'decided', 
                           'tradeoff', 'reason', 'repeat', 'again', 'every time', 
                           'workflow', 'fix', 'bug', 'issue', 'error', 'wrong', 'incorrect',
                           'should', 'must', 'dont', 'delete', 'remove', 'change']
                lower = text.lower()
                if any(kw in lower for kw in keywords) and len(text) > 20:
                    print(f'\n  USER [{msg_id[:20]}]: {text[:500]}')
        except:
            pass

conn.close()
