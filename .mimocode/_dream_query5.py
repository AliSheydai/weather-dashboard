import sqlite3, json
DB = r'C:\Users\AFRAA\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get ALL recent file changes (last 7 days) from non-writer, non-dream sessions
cur.execute("""
    SELECT s.title, json_extract(p.data, '$.tool') as tool, 
           json_extract(json_extract(p.data, '$.state'), '$.input') as input_data
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
      AND s.time_created > strftime('%s', 'now', '-7 days')
      AND s.title NOT LIKE 'checkpoint-writer:%'
      AND s.title NOT LIKE 'Auto Dream%'
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
    ORDER BY m.time_created DESC
    LIMIT 50
""")

for title, tool, inp_raw in cur.fetchall():
    try:
        inp = json.loads(inp_raw) if inp_raw else {}
        path = inp.get('file_path', inp.get('path', 'N/A'))
        # Extract just the filename
        if path and path != 'N/A':
            fname = path.split('\\')[-1] if '\\' in path else path.split('/')[-1]
            print(f'{title[:45]:45s} | {tool:5s} | {fname}')
    except:
        pass

# Also check what phases the user mentioned in recent sessions
print('\n\n=== USER PHASE REFERENCES ===')
cur.execute("""
    SELECT s.title, m.id, p.data
    FROM message m
    JOIN part p ON p.message_id = m.id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = 'd3aa5750-e996-4dcf-b5b2-5b2ef3f30467'
      AND s.time_created > strftime('%s', 'now', '-14 days')
      AND json_extract(m.data, '$.role') = 'user'
    ORDER BY m.time_created DESC
    LIMIT 100
""")

for title, msg_id, pdata in cur.fetchall():
    try:
        d = json.loads(pdata)
        if d.get('type') == 'text':
            text = d.get('text', '')
            lower = text.lower()
            if ('phase' in lower or 'responsive' in lower) and len(text) > 20 and 'system-reminder' not in text[:50]:
                print(f'\n  [{title[:30]}]: {text[:300]}')
    except:
        pass

conn.close()
