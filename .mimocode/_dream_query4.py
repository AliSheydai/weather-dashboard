import sqlite3, json
DB = r'C:\Users\AFRAA\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Check the security audit session and responsive session for user rules
sessions = [
    ('ses_03d596e8bffeZ165baA4T7YFY5', 'Security audit'),
    ('ses_012d76e55ffe0LXjEKI4u1LMuW', 'Responsive.md'),
    ('ses_012d8c2aeffeockYpm5e4NqFRA', 'Sunset card bug'),
]

for sid, label in sessions:
    print(f'\n=== {label} ({sid}) ===')
    cur.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role, p.data
        FROM message m
        JOIN part p ON p.message_id = m.id
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'user'
        ORDER BY m.time_created
    """, (sid,))
    
    for msg_id, role, pdata in cur.fetchall():
        try:
            d = json.loads(pdata)
            if d.get('type') == 'text':
                text = d.get('text', '')
                if len(text) > 30 and 'system-reminder' not in text[:50]:
                    print(f'\n  USER: {text[:600]}')
        except:
            pass

# Also check for assistant tool calls that created/edited files in the most recent sessions
print('\n\n=== RECENT FILE CHANGES (last 7 days, non-writer sessions) ===')
cur.execute("""
    SELECT m.session_id, s.title, p.data
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
      AND s.time_created > strftime('%s', 'now', '-7 days')
      AND s.title NOT LIKE 'checkpoint-writer:%'
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
    ORDER BY m.time_created DESC
    LIMIT 30
""")

for sid, title, pdata in cur.fetchall():
    try:
        d = json.loads(pdata)
        tool = d.get('tool', '')
        inp = d.get('state', {}).get('input', {})
        path = inp.get('file_path', inp.get('path', ''))
        if path:
            print(f'  {title[:40]:40s} | {tool:5s} | {path}')
    except:
        pass

conn.close()
