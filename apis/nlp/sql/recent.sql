SELECT key,proper,old_root,root,abbreviation,singular,plural,acronym,list_count,rs_count FROM crawl.words WHERE
old_root!=root AND old_root!=singular AND vrsn=5017 AND list_count>30
ORDER BY timestamp DESC LIMIT 500;