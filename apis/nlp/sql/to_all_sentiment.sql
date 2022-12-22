-- SELECT count(*) FROM crawl.words WHERE (error='' OR error IS NULL) AND all_sentiment IS NOT NULL AND vrsn<1019 AND list_count>=2 AND list_count<6 AND sources_count>=2 AND sentiment IS NULL

-- SELECT vrsn,key,sentiment,all_sentiment,list_count,sources_count,list,pos1,pos2,plural FROM crawl.words 
-- WHERE (error='' OR error IS NULL) AND vrsn<1019 AND list_count>=3 AND list_count<6 AND sources_count>=4 AND sentiment IS NULL ORDER BY list_count DESC, sources_count DESC LIMIT 500;

-- SELECT count(*)
SELECT vrsn,key,sentiment,a_sentiment,b_sentiment,list_count,sources_count,list,pos1,pos2,plural 
FROM crawl.words WHERE (error='' OR error IS NULL) AND 
vrsn<1025 AND sentiment IS NOT NULL AND a_sentiment IS NULL
ORDER BY list_count DESC, sources_count DESC LIMIT 500;

