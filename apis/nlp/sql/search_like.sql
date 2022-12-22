-- DELETE FROM crawl.words WHERE list_count IS NULL;
-- SELECT count(*) FROM crawl.words WHERE list_count IS NULL;
-- SHOW work_mem;
-- CREATE EXTENSION pg_trgm WITH SCHEMA pg_catalog;
-- CREATE INDEX trgm_idx_list ON crawl.words USING gin (list gin_trgm_ops);
-- CREATE INDEX trgm_idx ON crawl.words USING GIST (sources gist_trgm_ops);
-- SET work_mem = '16MB';
SELECT key, best, pos1, list, e_sentiment, list_count, rs_count FROM crawl.words WHERE list_count>=1 AND e_sentiment>-1 AND key ILIKE e'abc%' ORDER BY list_count DESC
-- row.list
SELECT key, best, pos1, pos2, list, e_sentiment, list_count, rs_count, (length(list) - length(replace(list, e'"dev"', '')) / length(e'"dev"')) AS occurrences 
FROM crawl.words WHERE list_count>=5 AND sources_count>=5 AND e_sentiment>-1 AND key!=e'"dev"' AND list ILIKE e'%"dev"%' ORDER BY occurrences DESC
-- SELECT key, list_count, (length(list) - length(replace(list, '"feather"', '')) / length('"feather"')) AS occurrences FROM crawl.words WHERE list ILIKE '%"feather"%' ORDER BY occurrences DESC LIMIT 25;
SELECT key, list_count, sources, (length(sources) - length(replace(sources, e'"heavy snow"', '')) / length(e'"heavy snow"')) AS occurrences 
-- 
FROM crawl.words WHERE list_count>1 AND sources_count>1 AND key!=e'"heavy snow"' AND sources ILIKE e'%"heavy snow"%' ORDER BY occurrences DESC


-- SELECT key, list_count FROM crawl.words WHERE list_count>1 AND sources_count>1 AND key!=e'"black"'
--     AND sources ILIKE e'%"black"%' ORDER BY list_count DESC LIMIT 25;